import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware, UserIdNotAuthMiddleware } from '../../../middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { TheoryNotebookRepository } from './theory-notebook.reponsitory';
import { TheoryNotebookController } from './theory-notebook.controller';
import { TheoryNotebookService } from './theory-notebook.service';
import { TheoryNotebookEntity } from './entities/theory-notebook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TheoryNotebookEntity]), AuthModule],
  controllers: [TheoryNotebookController],
  providers: [TheoryNotebookService, TheoryNotebookRepository],
  exports: [TheoryNotebookService, TheoryNotebookRepository],
})
export class TheoryNotebookModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes(
        { path: 'theory-notebook', method: RequestMethod.GET},
        { path: 'theory-notebook', method: RequestMethod.POST},
        { path: 'theory-notebook', method: RequestMethod.PUT},
      )
  }
}
