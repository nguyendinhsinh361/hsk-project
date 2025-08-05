import { BaseInterfaceRepository } from '../../../../base/mysql/base.interface.repository';
import { AIResultEntity } from '../entities/ai-result.entity';
export type AIResultRepositoryInterface =
  BaseInterfaceRepository<AIResultEntity>;
