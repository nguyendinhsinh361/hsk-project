import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { LimitedRequestsMiddleware } from '../../middleware/limitedRequests.middleware';
import { SupperKeyMiddleware } from '../../middleware/supper-key.middleware';
import { SupperPasswordKeyModule } from './supper-password-key/chatgpt.module';

@Module({
  imports: [SupperPasswordKeyModule],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService]
})
export class SystemModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LimitedRequestsMiddleware, SupperKeyMiddleware)
      .forRoutes(
        { path: 'system/supper-key', method: RequestMethod.GET},
      );
    }
}