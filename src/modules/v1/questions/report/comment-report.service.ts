import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QuestionCommentReportRepository } from './comment-report.repository';
import { CreateCommentReportDto } from '../../practice-writing/dtos/createCommentReport.dto';
import { IResponse } from '../../../../common/interfaces/response.interface';
import { QuestionCommentRepository } from '../comment/comment.repository';
import * as Sentry from "@sentry/node";
@Injectable()
export class QuestionCommentReportService {
    constructor(
        private readonly questionCommentReportRepository: QuestionCommentReportRepository,
        private readonly questionCommentRepository: QuestionCommentRepository
    ) {}

    async reportComment(user_id: string, createCommentReportDto: CreateCommentReportDto) {
        try {
            if(!user_id) {
                throw new HttpException(
                    `Invalid token`,
                    HttpStatus.FORBIDDEN,
                );
            }
            const {commentId, content} = createCommentReportDto

            const findCommentDetail = await this.questionCommentRepository.findOneById(commentId)

            const data = {
                userId: user_id,
                questionId: findCommentDetail.questionId,
                commentId: createCommentReportDto.commentId,
                content: createCommentReportDto.content,
            }
            const newReport = await this.questionCommentReportRepository.create(data)
            const dataResponse: IResponse = {
                message: `Create new report for comment_id ${commentId} successfully`,
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
}