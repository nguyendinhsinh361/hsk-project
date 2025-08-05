import { BaseInterfaceRepository } from '../../../../base/mysql/base.interface.repository';
import { EventEntity } from '../entities/event.entity';
export type EventRepositoryInterface =
  BaseInterfaceRepository<EventEntity>;
