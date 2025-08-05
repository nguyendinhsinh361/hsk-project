import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware } from '../../../../middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { AuthService } from '../../../../modules/auth/auth.service';
import { AuthModule } from '../../../../modules/auth/auth.module';
import { PurchaseModule } from '../../purchase/purchase.module';
import { PurchaseService } from '../../purchase/purchase.service';
import { DeviceModule } from '../../device/device.module';
import { DeviceService } from '../../device/device.service';
import { HttpModule } from '@nestjs/axios';
import { SystemModule } from '../../../../modules/system/system.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, PurchaseModule, DeviceModule, HttpModule, SystemModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository, PurchaseService, DeviceService],
  exports: [AccountService, AccountRepository]
})
export class AccountModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes(
        { path: 'account/logout', method: RequestMethod.POST },
        { path: 'account/initLogin', method: RequestMethod.POST },
        { path: 'account/deleteDevice', method: RequestMethod.POST },
        { path: 'account/deleteAccount', method: RequestMethod.POST },
        { path: 'account/deleteToken', method: RequestMethod.DELETE },
        { path: 'account/updateUserInformation', method: RequestMethod.PUT },        
      )
  }
}