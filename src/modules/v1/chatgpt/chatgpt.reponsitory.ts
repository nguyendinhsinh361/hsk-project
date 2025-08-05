import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGPTUsageRepositoryInterface } from './interfaces/chatgpt.repository.interface';
import { UsageEntity } from './entities/chatgpt-usage.entity';

@Injectable()
export class ChatGPTUsageRepository
  extends BaseAbstractRepository<UsageEntity>
  implements ChatGPTUsageRepositoryInterface
{
  constructor(
    @InjectRepository(UsageEntity)
    private readonly chatGPTUsageRepository: Repository<UsageEntity>,
  ) {
    super(chatGPTUsageRepository);
  }
}
