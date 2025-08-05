import { BaseInterfaceRepository } from 'src/base/mysql/base.interface.repository';
import { UserHistoryDivination } from '../entities/user-history-divination.entity';

export type UserHistoryDivinationRepositoryInterface =
  BaseInterfaceRepository<UserHistoryDivination>;
