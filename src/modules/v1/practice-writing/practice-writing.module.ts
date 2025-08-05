import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { QuestionCommenteModule } from "../questions/comment/comment.module";
import { QuestionCommentVoteModule } from "../questions/vote/comment-vote.module";
import { QuestionCommentService } from "../questions/comment/comment.service";
import { QuestionCommentVoteService } from "../questions/vote/comment-vote.service";
import { PracticeWritingService } from "./practice-writing.service";
import { PracticeWritingController } from "./practice-writing.controller";
import { UserIdMiddleware } from "../../../middleware/auth.middleware";
import { LimitedRequestsMiddleware } from "../../../middleware/limitedRequests.middleware";
import { AuthModule } from "../../../modules/auth/auth.module";
import { QuestionCommentReportModule } from "../questions/report/comment-report.module";
import { QuestionModule } from "../questions/question/question.module";
import { AccountModule } from "../user/account/account.module";


@Module({
  imports: [QuestionCommenteModule, QuestionCommentVoteModule, QuestionCommentReportModule, QuestionModule, AccountModule, AuthModule],
  controllers: [PracticeWritingController],
  providers: [PracticeWritingService, QuestionCommentService, QuestionCommentVoteService],
  exports: []
})
export class PracticeWritingModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware, LimitedRequestsMiddleware)
      .forRoutes(
        { path: 'practice-writing/comment', method: RequestMethod.POST},
        { path: 'practice-writing/question/upvote', method: RequestMethod.POST},
        { path: 'practice-writing/comment/upvote', method: RequestMethod.POST},
        { path: 'practice-writing/make-question', method: RequestMethod.POST},
        { path: 'practice-writing/report', method: RequestMethod.POST},
        { path: 'practice-writing/comment/:questionId', method: RequestMethod.GET},
        { path: 'practice-writing/question', method: RequestMethod.GET},
        { path: 'practice-writing/comment-child/:commentId', method: RequestMethod.GET},
      );
    }
}