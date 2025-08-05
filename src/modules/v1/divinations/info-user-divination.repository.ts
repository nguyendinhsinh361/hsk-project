import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from 'src/base/mysql/base.abstract.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfoUserDivination } from './entities/user-info-divination.entity';
import { InfoUserDivinationRepositoryInterface } from './interfaces/info-user-divination.repository.interface';

@Injectable()
export class InfoUserDivinationRepository
  extends BaseAbstractRepository<InfoUserDivination>
  implements InfoUserDivinationRepositoryInterface
{
  constructor(
    @InjectRepository(InfoUserDivination)
    private readonly infoUserDivinationRepo: Repository<InfoUserDivination>,
  ) {
    super(infoUserDivinationRepo);
  }
}
