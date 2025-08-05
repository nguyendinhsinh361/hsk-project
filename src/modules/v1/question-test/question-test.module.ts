import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionTestEntity } from './entities/question-test.entity';
import { QuestionTestController } from './question-test.controller';
import { UserIdMiddleware, UserIdNotAuthMiddleware } from '../../../middleware/auth.middleware';
import { QuestionTestService } from './question-test.service';
import { QuestionTestRepository } from './question-test.repository';
import { AuthModule } from '../../../modules/auth/auth.module';
import { PurchaseModule } from '../purchase/purchase.module';
import { AccountModule } from '../user/account/account.module';


@Module({
  imports: [TypeOrmModule.forFeature([QuestionTestEntity]), AuthModule, PurchaseModule, AccountModule],
  controllers: [QuestionTestController],
  providers: [QuestionTestService, QuestionTestRepository],
  exports: [QuestionTestService, QuestionTestRepository]
})
export class QuestionTestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes(
        { path: 'question-test/:questionTestId', method: RequestMethod.GET },
        { path: 'question-test/exam-detail/:examId', method: RequestMethod.GET },
      )
    consumer
      .apply(UserIdNotAuthMiddleware)
      .forRoutes(
        { path: 'question-test/listExamIds/:level', method: RequestMethod.GET },
        { path: 'question-test/list-ids', method: RequestMethod.POST },
      )

  }
}