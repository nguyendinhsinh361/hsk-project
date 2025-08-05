import { BaseAbstractRepository } from "../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { AIResultEntity } from "./entities/ai-result.entity";
import { AIResultRepositoryInterface } from "./interfaces/ai-result.repository.interface";

@Injectable()
export class AIResultRepository
  extends BaseAbstractRepository<AIResultEntity>
  implements AIResultRepositoryInterface
{
    constructor(
        @InjectRepository(AIResultEntity)
        private readonly aIResultRepository: Repository<AIResultEntity>,
      ) {
        super(aIResultRepository);
      }
}
