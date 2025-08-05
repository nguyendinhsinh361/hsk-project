import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionEntity } from './entities/question.entity';
import {  QuestionService } from './question.service';
import { QuestionRepository } from './question.repository';
import { SystemModule } from '../../../../modules/system/system.module';
import { PurchaseModule } from '../../purchase/purchase.module';
import { AccountModule } from '../../user/account/account.module';
import { QuestionCommentVoteModule } from '../vote/comment-vote.module';
import { QuestionCommenteModule } from '../comment/comment.module';
import { QuestionController } from './question.controller';
import { UserIdMiddlewareOption } from '../../../../middleware/auth.middleware';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionEntity]), SystemModule, AccountModule, QuestionCommentVoteModule, QuestionCommenteModule, PurchaseModule, AuthModule],
  controllers: [QuestionController],
  providers: [QuestionService, QuestionRepository],
  exports: [QuestionService, QuestionRepository]
})
export class QuestionModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(UserIdMiddlewareOption)
        .forRoutes(
            { path: 'question/get-question-practice', method: RequestMethod.GET }
        )
  }
}