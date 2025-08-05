import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIResultEntity } from './entities/ai-result.entity';
import { AIResultController } from './ai-result.controller';
import { AIResultService } from './ai-result.service';
import { AIResultRepository } from './ai-result.reponsitory';
import { UserIdMiddleware } from '../../../middleware/auth.middleware';
import { AuthModule } from '../../../modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AIResultEntity]), AuthModule],
  controllers: [AIResultController],
  providers: [AIResultService, AIResultRepository],
  exports: [AIResultService, AIResultRepository]
})
export class AIResultModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(UserIdMiddleware)
        .forRoutes(
          { path: 'ai-result', method: RequestMethod.PUT },
        )
  }
}