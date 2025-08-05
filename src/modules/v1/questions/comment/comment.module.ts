import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionCommentEntity } from './entities/comment.entity';
import { QuestionCommentRepository } from './comment.repository';
import { QuestionCommentService } from './comment.service';
import { QuestionCommentVoteModule } from '../vote/comment-vote.module';
import { AccountModule } from '../../user/account/account.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionCommentEntity]), QuestionCommentVoteModule, AccountModule],
  controllers: [],
  providers: [QuestionCommentService, QuestionCommentRepository],
  exports: [QuestionCommentService, QuestionCommentRepository]
})
export class QuestionCommenteModule {
//   public configure(consumer: MiddlewareConsumer) {
//     consumer
//         .apply(UserIdMiddleware)
//         .forRoutes(
//             { path: 'auth', method: RequestMethod.POST }
//         )
// }
}