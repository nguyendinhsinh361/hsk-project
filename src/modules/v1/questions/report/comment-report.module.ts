import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionCommentReportEntity } from './entities/comment-report.entity';
import { QuestionCommentReportService } from './comment-report.service';
import { QuestionCommentReportRepository } from './comment-report.repository';
import { QuestionCommenteModule } from '../comment/comment.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionCommentReportEntity]), QuestionCommenteModule],
  controllers: [],
  providers: [QuestionCommentReportService, QuestionCommentReportRepository],
  exports: [QuestionCommentReportService, QuestionCommentReportRepository]
})
export class QuestionCommentReportModule {
//   public configure(consumer: MiddlewareConsumer) {
//     consumer
//         .apply(UserIdMiddleware)
//         .forRoutes(
//             { path: 'auth', method: RequestMethod.POST }
//         )
// }
}