import { Injectable } from '@nestjs/common';
import { QuestionCommentVoteRepository } from './comment-vote.repository';

@Injectable()
export class QuestionCommentVoteService {
    constructor(private readonly questionCommentVoteRepository: QuestionCommentVoteRepository) {}

    async checkUserQuestionUpvote(data: any) {
        return await this.questionCommentVoteRepository.findByCondition(data)
    }

    async createUserQuestionUpvote(data: any) {
        return await this.questionCommentVoteRepository.create(data)
    }

    async updateUserQuestionUpvote(id: number, data: any) {
        return await this.questionCommentVoteRepository.update(id, data)
    }
}