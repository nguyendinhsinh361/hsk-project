import { BaseInterfaceRepository } from '../../../../base/mysql/base.interface.repository';
import { EventPrizeEntity } from '../entities/event-prize.entity';
export type EventPrizeRepositoryInterface =
  BaseInterfaceRepository<EventPrizeEntity>;
