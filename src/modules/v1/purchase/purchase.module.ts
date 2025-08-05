import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware } from '../../../middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseEntity } from './entities/purchase.entity';
import { PurchaseService } from './purchase.service';
import { PurchaseRepository } from './purchase.reponsitory';
import { PurchaseController } from './purchase.controller';
import { AuthModule } from '../../../modules/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { BankingActiveKeyMiddleware } from 'src/middleware/banking-active.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseEntity]), AuthModule, HttpModule],
  controllers: [PurchaseController],
  providers: [PurchaseService, PurchaseRepository],
  exports: [PurchaseService, PurchaseRepository]
})
export class PurchaseModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(UserIdMiddleware)
        .forRoutes(
            { path: 'purchase/verifiedGoogleStore', method: RequestMethod.POST },
            { path: 'purchase/verifiedAppleStore', method: RequestMethod.POST },
            { path: 'purchase/virtualBill', method: RequestMethod.POST },
        )
        consumer
        .apply(BankingActiveKeyMiddleware)
        .forRoutes(
            { path: 'purchase/bankingActive', method: RequestMethod.POST },
        )
  }
}