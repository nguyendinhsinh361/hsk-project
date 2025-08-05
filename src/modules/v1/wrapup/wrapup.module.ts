import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware } from '../../../middleware/auth.middleware';
import { AuthModule } from '../../../modules/auth/auth.module';
import { WrapUpController } from './wrapup.controller';
import { WrapUpService } from './wrapup.service';
import { AccountModule } from '../user/account/account.module';
import { UserSynchronizedPracticeModule } from '../users-synchronized-practice/users-synchronized-practice.module';
import { WrapupRepository } from './repo/wrapup.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupperKeyMiddleware } from '../../../middleware/supper-key.middleware';
import { MissionsEntity } from './entities/missisons.entity';
import { PurchaseModule } from '../purchase/purchase.module';
import { MissionsUsersRepository } from './repo/mission-user.repository';
import { MissionsUsersEntity } from './entities/missisons_users.entity';
import { RankingEntity } from './entities/ranking.entity';
import { RankingRepository } from './repo/ranking.repository';
// import { CacheService } from '../../../modules/cache/cache.service';


@Module({
  imports: [TypeOrmModule.forFeature([MissionsEntity, MissionsUsersEntity, RankingEntity]), AuthModule, AccountModule, UserSynchronizedPracticeModule, PurchaseModule],
  controllers: [WrapUpController],
  providers: [WrapUpService, WrapupRepository, MissionsUsersRepository, RankingRepository],
  exports: []
})
export class WrapUpModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(UserIdMiddleware)
        .forRoutes(
          { path: 'wrapup', method: RequestMethod.GET},
          { path: 'wrapup/mission', method: RequestMethod.GET},
          { path: 'wrapup/mission/synchronize', method: RequestMethod.PUT},
          { path: 'wrapup/mission/ranking', method: RequestMethod.GET},
        )
    consumer
        .apply(SupperKeyMiddleware)
        .forRoutes(
          { path: 'wrapup/mission', method: RequestMethod.DELETE},
          { path: 'wrapup/fake-ranking', method: RequestMethod.POST},
        );
  }
}