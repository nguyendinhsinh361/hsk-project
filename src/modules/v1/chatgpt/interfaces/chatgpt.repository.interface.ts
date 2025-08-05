import { BaseInterfaceRepository } from '../../../../base/mysql/base.interface.repository';
import { UsageEntity } from '../entities/chatgpt-usage.entity';
export type ChatGPTUsageRepositoryInterface =
  BaseInterfaceRepository<UsageEntity>;
