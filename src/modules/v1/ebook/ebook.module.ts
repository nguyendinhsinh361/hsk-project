import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware, UserIdNotAuthMiddleware } from '../../../middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { EbookEntity } from './entities/ebook.entity';
import { EbooksUsersEntity } from './entities/ebook-user.entity';
import { EbookController } from './ebook.controller';
import { EbookService } from './ebook.service';
import { EbookRepository } from './repo/ebook-user.repository';
import { EbooksUsersRepository } from './repo/ebook.repository';
import { SupperKeyMiddleware } from 'src/middleware/supper-key.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([EbookEntity, EbooksUsersEntity]), AuthModule],
  controllers: [EbookController],
  providers: [EbookService, EbookRepository, EbooksUsersRepository],
  exports: [EbookService, EbookRepository, EbooksUsersRepository],
})
export class EbookModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes(
        { path: 'ebook', method: RequestMethod.GET},
        { path: 'ebook/synchronize', method: RequestMethod.POST},
      )
    consumer
      .apply(SupperKeyMiddleware)
      .forRoutes(
        { path: 'ebook', method: RequestMethod.DELETE},
        { path: 'ebook/:ebookId', method: RequestMethod.PUT},
      );
  }
}
