import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventRepositoryInterface } from './interfaces/event.repository.interface';
import { EventEntity } from './entities/event.entity';

@Injectable()
export class EventRepository
  extends BaseAbstractRepository<EventEntity>
  implements EventRepositoryInterface
{
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {
    super(eventRepository);
  }

  async getEventTimeNewest() {
    return this.eventRepository.createQueryBuilder('event')
    .select(['MIN(event.start) AS start', 'end', 'MIN(event.created_at) AS created_at'])
    .where('event.active = :active', { active: 1 })
    .groupBy('event.end')
    .orderBy('created_at', 'DESC')
    .getRawMany();
  }
}
