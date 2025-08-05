import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DivinationController } from './divination.controller';
import { DivinationService } from './divination.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHistoryDivination } from './entities/user-history-divination.entity';
import { UserHistoryDivinationRepository } from './user-history-divination.repository';
import { UserIdMiddleware } from 'src/middleware/auth.middleware';
import { AuthModule } from 'src/modules/auth/auth.module';
import { InfoUserDivinationRepository } from './info-user-divination.repository';
import { InfoUserDivination } from './entities/user-info-divination.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserHistoryDivination, InfoUserDivination]),
    AuthModule,
  ],
  controllers: [DivinationController],
  providers: [
    DivinationService,
    UserHistoryDivinationRepository,
    InfoUserDivinationRepository,
  ],
})
export class DivinationModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes(
        { path: 'divination', method: RequestMethod.GET },
        { path: 'divination/:divinationId', method: RequestMethod.GET },
        { path: 'divination', method: RequestMethod.POST },
        { path: 'divination/info-user', method: RequestMethod.GET },
        { path: 'divination/info-user', method: RequestMethod.POST },
      );
  }
}
