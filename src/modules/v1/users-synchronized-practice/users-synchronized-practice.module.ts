import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware, UserIdNotAuthMiddleware } from '../../../middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../modules/auth/auth.module';
import { UserSynchronizedPracticeController } from './users-synchronized-practice.controller';
import { UserSynchronizedPracticeService } from './users-synchronized-practice.service';
import { UserSynchronizedPracticeRepository } from './users-synchronized-practice.reponsitory';
import { UserSynchronizedPracticeEntity } from './entities/users-synchronized-practice.entity';
import { AIResultModule } from '../ai-result/ai-result.module';


@Module({
  imports: [TypeOrmModule.forFeature([UserSynchronizedPracticeEntity]), AuthModule, AIResultModule],
  controllers: [UserSynchronizedPracticeController],
  providers: [UserSynchronizedPracticeService, UserSynchronizedPracticeRepository],
  exports: [UserSynchronizedPracticeService, UserSynchronizedPracticeRepository]
})
export class UserSynchronizedPracticeModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(UserIdMiddleware)
        .forRoutes(
          { path: 'user-synchronized-practice/:historyId', method: RequestMethod.GET},
        )
}
}