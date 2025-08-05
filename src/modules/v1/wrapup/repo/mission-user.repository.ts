import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { BaseAbstractRepository } from '../../../../base/mysql/base.abstract.repository';
import { Repository } from 'typeorm';
import { MissionsUsersEntity } from '../entities/missisons_users.entity';
import { MissionsUsersRepositoryInterface } from '../interfaces/missions-users.repository.interface';

@Injectable()
export class MissionsUsersRepository
  extends BaseAbstractRepository<MissionsUsersEntity>
  implements MissionsUsersRepositoryInterface
{
    constructor(
        @InjectRepository(MissionsUsersEntity)
        private readonly missionsUsersRepository: Repository<MissionsUsersEntity>,
      ) {
        super(missionsUsersRepository);
      }
}
