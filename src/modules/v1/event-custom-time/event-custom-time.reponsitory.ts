import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventCustomTimeEntity } from './entities/event-custom-time.entity';
import { EventCustomTimeRepositoryInterface } from './interfaces/event-custom-time.repository.interface';

@Injectable()
export class EventCustomTimeRepository
  extends BaseAbstractRepository<EventCustomTimeEntity>
  implements EventCustomTimeRepositoryInterface
{
  constructor(
    @InjectRepository(EventCustomTimeEntity)
    private readonly eventCustomTimeRepository: Repository<EventCustomTimeEntity>,
  ) {
    super(eventCustomTimeRepository);
  }
}
