import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseModule } from '../purchase/purchase.module';
import { ReasonCancelController } from './reason-cancel.controller';
import { ReasonCancelService } from './reason-cancel.service';
import { ReasonCancelRepository } from './reason-cancel.reponsitory';
import { ReasonCancelEntity } from './entities/reason-cancel.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ReasonCancelEntity])],
  controllers: [ReasonCancelController],
  providers: [ReasonCancelService, ReasonCancelRepository],
  exports: []
})
export class ReasonCancelModule {
//   public configure(consumer: MiddlewareConsumer) {
//     consumer
//         .apply(UserIdMiddleware)
//         .forRoutes(
//           { path: 'exam/listExam', method: RequestMethod.POST },
//           { path: 'exam/exam', method: RequestMethod.POST },
//         )
// }
}