import { BaseAbstractRepository } from '../../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EbookEntity } from '../entities/ebook.entity';
import { EbookRepositoryInterface } from '../interfaces/ebook.repository.interface';

@Injectable()
export class EbookRepository
  extends BaseAbstractRepository<EbookEntity>
  implements EbookRepositoryInterface
{
  constructor(
    @InjectRepository(EbookEntity)
    private readonly ebookRepository: Repository<EbookEntity>,
  ) {
    super(ebookRepository);
  }
}
