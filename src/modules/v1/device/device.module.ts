import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersDeviceManagerEntity } from './entities/device.entity';
import { DeviceService } from './device.service';
import { DeviceRepository } from './device.dto.reponsitory';

@Module({
  imports: [TypeOrmModule.forFeature([UsersDeviceManagerEntity])],
  controllers: [],
  providers: [DeviceService, DeviceRepository],
  exports: [DeviceService, DeviceRepository]
})
export class DeviceModule {
//   public configure(consumer: MiddlewareConsumer) {
//     consumer
//         .apply(UserIdMiddleware)
//         .forRoutes(
//             { path: 'auth', method: RequestMethod.POST }
//         )
// }
}