import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserIdMiddleware } from 'src/middleware/auth.middleware';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserTracking } from './entities/user-tracking.entity';
import { UserTrackingController } from './user-tracking.controller';
import { UserTrackingService } from './user-tracking.service';
import { UserTrackingRepository } from './user-tracking.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserTracking]), AuthModule],
  controllers: [UserTrackingController],
  providers: [UserTrackingService, UserTrackingRepository],
  exports: []
})
export class UserTrackingModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes(
        { path: "user/userTracking", method: RequestMethod.POST },
      )
  }
}