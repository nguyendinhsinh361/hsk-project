import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { SupportAdminMiddleware, UserIdMiddleware } from '../../../middleware/auth.middleware';
import { PurchaseModule } from '../purchase/purchase.module';
import { AwardsController } from './awards.controller';
import { AwardsService } from './awards.service';
import { AccountModule } from '../user/account/account.module';
import { AuthModule } from '../../../modules/auth/auth.module';
import { EventCustomTimeModule } from '../event-custom-time/event-custom-time.module';
import { EventPrizeModule } from '../event_prize/event-prize.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [PurchaseModule, AccountModule, AuthModule, EventCustomTimeModule, EventModule, EventPrizeModule],
  controllers: [AwardsController],
  providers: [AwardsService],
  exports: [AwardsService]
})
export class AwardsModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(SupportAdminMiddleware)
        .forRoutes(
            { path: 'awards/custom-mia', method: RequestMethod.POST },
        )
    consumer
    .apply(UserIdMiddleware)
    .forRoutes(
        { path: 'awards/trial-mia', method: RequestMethod.POST },
    );
  }
}