import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { BaseAbstractRepository } from '../../../../base/mysql/base.abstract.repository';
import { Repository } from 'typeorm';
import { MissionsEntity } from '../entities/missisons.entity';
import { MissionsRepositoryInterface } from '../interfaces/wrapup.repository.interface';

@Injectable()
export class WrapupRepository
  extends BaseAbstractRepository<MissionsEntity>
  implements MissionsRepositoryInterface
{
    constructor(
        @InjectRepository(MissionsEntity)
        private readonly missionsRepository: Repository<MissionsEntity>,
      ) {
        super(missionsRepository);
      }
}
