import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QuestionCommentRepository } from './comment.repository';
import { CreateCommentDto } from '../../practice-writing/dtos/createComment.dto';
import { IResponse } from '../../../../common/interfaces/response.interface';
import { PaginateCommentFilterDto, PaginateDto, PaginateFilterDto } from '../../../../common/dtos/paginate.dto';
import { UpvoteCommentDto } from '../../practice-writing/dtos/upvoteComment.dto';
import { QuestionCommentVoteService } from '../vote/comment-vote.service';
import { AccountRepository } from '../../user/account/account.repository';
import * as Sentry from "@sentry/node";
@Injectable()
export class QuestionCommentService {
    constructor(
        private readonly questionCommentRepository: QuestionCommentRepository,
        private readonly questionCommentVoteService: QuestionCommentVoteService,
        private readonly accountRepository: AccountRepository,
    ) {}


    async getAllCommentChild(user_id: string, paginateDto: PaginateDto, commentId: string) {
        try {
            if(!user_id) {
                throw new HttpException(
                    `Invalid token`,
                    HttpStatus.FORBIDDEN,
                );
            }
            const allCommentChildOfQuestions = await this.questionCommentRepository.getAllWithCommentId(commentId, paginateDto.limit, paginateDto.page)
            const allCommentChildOfQuestionsResult = await Promise.all(allCommentChildOfQuestions.map(async (ele) => {
                const questionVoteCommentDetail = await this.questionCommentVoteService.checkUserQuestionUpvote({userId: +user_id,  commentId: ele.id})
                const detailUser = await this.accountRepository.findOne({
                    where: {id: ele.userId},
                    select: ["name", "email", "avatar"]
                })

                let isUpvote = 0
                if(questionVoteCommentDetail) {
                    isUpvote = questionVoteCommentDetail.upvoteQuestion
                }
                return {
                    ...ele,
                    isUpvote: isUpvote,
                    infoUser: detailUser,
                }
            }))
            const dataResponse: IResponse = {
                message: 'Get comments successfully!',
                data: allCommentChildOfQuestionsResult,
            };
            return dataResponse
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
        }
    }
    
    async getAllComment(user_id: string, paginateDto: PaginateCommentFilterDto, questionId: string) {
        try {
            if(!user_id) {
                throw new HttpException(
                    `Invalid token`,
                    HttpStatus.FORBIDDEN,
                );
            }
            const allCommentOfQuestions = await this.questionCommentRepository.getAllWithQuestionId(questionId, paginateDto)
            const allCommentOfQuestionsResult = await Promise.all(allCommentOfQuestions.map(async (ele) => {
                const questionVoteCommentDetail = await this.questionCommentVoteService.checkUserQuestionUpvote({userId: +user_id,  commentId: ele.id})
                const detailUser = await this.accountRepository.findOne({
                    where: {id: ele.userId},
                    select: ["name", "email", "avatar"]
                })

                let isUpvote = 0
                if(questionVoteCommentDetail) {
                    isUpvote = questionVoteCommentDetail.upvoteComment
                }
                return {
                    ...ele,
                    isUpvote: isUpvote,
                    infoUser: detailUser,
                }
            }))
            const dataResponse: IResponse = {
                message: 'Get comments successfully!',
                data: allCommentOfQuestionsResult,
            };
            return dataResponse
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
        }
    }

    async createComment(user_id: string, createCommentDto: CreateCommentDto) {
        try {
            if(!user_id) {
                throw new HttpException(
                    `Invalid token`,
                    HttpStatus.FORBIDDEN,
                );
            }
            const data = {
                questionId: createCommentDto.questionId,
                userId: user_id,
                content: createCommentDto.content,
                parentId: createCommentDto.parentId,
                language: createCommentDto.language
            }

            const newComment = await this.questionCommentRepository.create(data)

            const dataResponse: IResponse = {
                message: `Create new comment for question_id ${newComment.questionId} successfully`,
                data: newComment,
            };
            return dataResponse
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
        }
    }

    async upvoteComment(user_id: string, upvoteCommentDto: UpvoteCommentDto) {
        try {
            if(!user_id) {
                throw new HttpException(
                    `Invalid token`,
                    HttpStatus.FORBIDDEN,
                );
            }

            const {commentId, isLike} = upvoteCommentDto

            const findCommentDetail = await this.questionCommentRepository.findOneById(commentId)
            const questionVoteCommentDetail = await this.questionCommentVoteService.checkUserQuestionUpvote({userId: +user_id, commentId})

            if(isLike) {
                await this.questionCommentRepository.update(commentId, {like : findCommentDetail.like + 1})
                if(questionVoteCommentDetail) {
                    await this.questionCommentVoteService.updateUserQuestionUpvote(questionVoteCommentDetail.id, {upvoteComment: 1})
                }else {
                    await this.questionCommentVoteService.createUserQuestionUpvote({userId: +user_id, commentId, upvoteComment: 1})
                }
            } else {
                if(findCommentDetail.like > 0)
                    await this.questionCommentRepository.update(commentId, {like: findCommentDetail.like - 1})
                if(questionVoteCommentDetail) {
                    await this.questionCommentVoteService.updateUserQuestionUpvote(questionVoteCommentDetail.id, {upvoteComment: 0})
                }
            }

            const dataResponse: IResponse = {
                message: `Update comment ${upvoteCommentDto.commentId} successfully`,
                data: [],
            };
            return dataResponse
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
        }
    }

    async getTotalComment(questionId: number) {
        return await this.questionCommentRepository.getTotalComment(questionId)
    }
}