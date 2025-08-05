import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionCommentVoteEntity } from './entities/comment-vote.entity';
import { QuestionCommentVoteService } from './comment-vote.service';
import { QuestionCommentVoteRepository } from './comment-vote.repository';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionCommentVoteEntity])],
  controllers: [],
  providers: [QuestionCommentVoteService, QuestionCommentVoteRepository],
  exports: [QuestionCommentVoteService, QuestionCommentVoteRepository]
})
export class QuestionCommentVoteModule {
//   public configure(consumer: MiddlewareConsumer) {
//     consumer
//         .apply(UserIdMiddleware)
//         .forRoutes(
//             { path: 'auth', method: RequestMethod.POST }
//         )
// }
}