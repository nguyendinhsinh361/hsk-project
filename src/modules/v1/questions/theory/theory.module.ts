import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheoryErrorRepository } from './theory.repository';
import {TheoryErrorService } from './theory.service';
import { QuestionCommentVoteModule } from '../vote/comment-vote.module';
import { AccountModule } from '../../user/account/account.module';
import { TheoryErrorEntity } from './entities/theory.entity';
import { TheoryErrorController } from './theory.controller';
import { UserIdMiddlewareOption } from "../../../../middleware/auth.middleware";
import { LimitedRequestsMiddleware } from "../../../../middleware/limitedRequests.middleware";
import { AuthModule } from '../../../../modules/auth/auth.module';
@Module({
  imports: [TypeOrmModule.forFeature([TheoryErrorEntity]), QuestionCommentVoteModule, AccountModule, AuthModule],
  controllers: [TheoryErrorController],
  providers: [TheoryErrorService, TheoryErrorRepository],
  exports: [TheoryErrorService, TheoryErrorRepository]
})
export class TheoryErrorModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddlewareOption, LimitedRequestsMiddleware)
      .forRoutes(
        { path: 'question/report-theory', method: RequestMethod.POST},
      );
    }
}