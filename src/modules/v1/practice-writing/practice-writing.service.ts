import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QuestionCommentService } from '../questions/comment/comment.service';
import { AccountService } from "../user/account/account.service";
import { IResponse } from "../../../common/interfaces/response.interface";
import { QuestionCommentVoteService } from '../questions/vote/comment-vote.service';

@Injectable()
export class PracticeWritingService {
    constructor(
        private readonly questionCommentService: QuestionCommentService, 
        private readonly questionCommentVoteService: QuestionCommentVoteService,
        private readonly accountService: AccountService,
    ) {}
    async getInfoUser(user_id: string, userIdGet: string) {
        if(!user_id) {
            throw new HttpException(
                `Invalid token`,
                HttpStatus.FORBIDDEN,
              );
        }
        const userDetail = await this.accountService.find({id: userIdGet})
        delete userDetail.password
        delete userDetail.created_at
        delete userDetail.updated_at

        const dataResponse: IResponse = {
            message: `Get user detail successfully`,
            data: userDetail,
        };
        return dataResponse
    }
}