import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventCustomTimeEntity } from './entities/event-custom-time.entity';
import { EventCustomTimeRepository } from './event-custom-time.reponsitory';
import { SystemModule } from '../../system/system.module';
import { EventCustomTimeService } from './event-custom-time.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventCustomTimeEntity]), SystemModule],
  controllers: [],
  providers: [EventCustomTimeService, EventCustomTimeRepository],
  exports: [EventCustomTimeService, EventCustomTimeRepository],
})
export class EventCustomTimeModule {}
