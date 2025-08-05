import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware, UserIdNotAuthMiddleware } from '../../../middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { TheoryLessonRepository } from './theory-lesson.reponsitory';
import { TheoryLessonEntity } from './entities/theory-lesson.entity';
import { TheoryLessonController } from './theory-lesson.controller';
import { TheoryLessonService } from './theory-lesson.service';
import { TheoryController } from './theory.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TheoryLessonEntity]), AuthModule],
  controllers: [TheoryLessonController, TheoryController],
  providers: [TheoryLessonService, TheoryLessonRepository],
  exports: [TheoryLessonService, TheoryLessonRepository],
})
export class TheoryLessonModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes(
        { path: 'theory-lesson', method: RequestMethod.GET},
        { path: 'theory-lesson', method: RequestMethod.POST},
      )
  }
}
