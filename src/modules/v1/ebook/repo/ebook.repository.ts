import { BaseAbstractRepository } from '../../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EbooksUsersEntity } from '../entities/ebook-user.entity';
import { EbookUserRepositoryInterface } from '../interfaces/ebook-user.repository.interface';

@Injectable()
export class EbooksUsersRepository
  extends BaseAbstractRepository<EbooksUsersEntity>
  implements EbookUserRepositoryInterface
{
  constructor(
    @InjectRepository(EbooksUsersEntity)
    private readonly ebooksUsersRepository: Repository<EbooksUsersEntity>,
  ) {
    super(ebooksUsersRepository);
  }
}
