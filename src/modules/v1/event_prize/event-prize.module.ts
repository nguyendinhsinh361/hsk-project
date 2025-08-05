import { TypeOrmModule } from '@nestjs/typeorm';
import { EventPrizeEntity } from './entities/event-prize.entity';
import { EventPrizeController } from './event-prize.controller';
import { EventPrizeService } from './event-prize.service';
import { EventPrizeRepository } from './event-prize.reponsitory';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([EventPrizeEntity])],
  controllers: [],
  providers: [EventPrizeService, EventPrizeRepository],
  exports: [EventPrizeService, EventPrizeRepository]
})
export class EventPrizeModule {}