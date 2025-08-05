import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventPrizeEntity } from './entities/event-prize.entity';
import { EventPrizeRepositoryInterface } from './interfaces/event-prize.repository.interface';

@Injectable()
export class EventPrizeRepository
  extends BaseAbstractRepository<EventPrizeEntity>
  implements EventPrizeRepositoryInterface
{
  constructor(
    @InjectRepository(EventPrizeEntity)
    private readonly eventPrizeRepository: Repository<EventPrizeEntity>,
  ) {
    super(eventPrizeRepository);
  }
}
