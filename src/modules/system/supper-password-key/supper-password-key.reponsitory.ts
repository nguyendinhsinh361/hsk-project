import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupperPasswordKeyEntity } from './entities/supper-password-key.entity';
import { SupperPasswordKeyRepositoryInterface } from './interfaces/supper-password-key.repository.interface';

@Injectable()
export class SupperPasswordKeyRepository
  extends BaseAbstractRepository<SupperPasswordKeyEntity>
  implements SupperPasswordKeyRepositoryInterface
{
  constructor(
    @InjectRepository(SupperPasswordKeyEntity)
    private readonly supperPasswordKeyRepository: Repository<SupperPasswordKeyEntity>,
  ) {
    super(supperPasswordKeyRepository);
  }
}
