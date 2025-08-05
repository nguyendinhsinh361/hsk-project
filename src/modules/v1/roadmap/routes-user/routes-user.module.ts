import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesUserController } from './routes-user.controller';
import { RoutesUserService } from './routes-user.service';
import { RoutesUserRepository } from './routes-user.reponsitory';
import { RoutesUserEntity } from './entities/routes-user.entity';
import { UserIdMiddleware } from '../../../../middleware/auth.middleware';
import { AuthModule } from '../../../../modules/auth/auth.module';
import { RoutesDefaultController } from '../routes-default/routes-default.controller';
import { RoutesDefaultEntity } from '../routes-default/entities/routes-default.entity';
import { RoutesDefaultService } from '../routes-default/routes-default.service';
import { RoutesDefaultRepository } from '../routes-default/routes-default.repository';
import { QuestionsEvaluateLevelRepository } from '../question-evaluate-level/question-evaluate-level.repository';
import { QuestionsEvaluateLevelService } from '../question-evaluate-level/question-evaluate-level.service';
import { QuestionsEvaluateLevelEntity } from '../question-evaluate-level/entities/question-evaluate-level.entity';


@Module({
  imports: [TypeOrmModule.forFeature([RoutesUserEntity, RoutesDefaultEntity, QuestionsEvaluateLevelEntity]), AuthModule],
  controllers: [RoutesUserController, RoutesDefaultController],
  providers: [RoutesUserService, RoutesUserRepository, RoutesDefaultService, RoutesDefaultRepository, QuestionsEvaluateLevelService, QuestionsEvaluateLevelRepository],
  exports: [RoutesUserService]
})
export class RoutesUserModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(UserIdMiddleware)
        .forRoutes(
          { path: 'roadmap/create', method: RequestMethod.POST },
          { path: 'roadmap/detail', method: RequestMethod.GET },
          { path: 'roadmap/update', method: RequestMethod.PUT },
          { path: 'roadmap/reset', method: RequestMethod.PUT },
          { path: 'roadmap/delete/:id', method: RequestMethod.DELETE },
          { path: 'roadmap/evaluate-exam', method: RequestMethod.POST },
          { path: 'roadmap/result-evaluate-exam', method: RequestMethod.POST },
        )
}
}