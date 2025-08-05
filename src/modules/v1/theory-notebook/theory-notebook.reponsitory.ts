import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TheoryNotebookEntity } from './entities/theory-notebook.entity';
import { TheoryNotebookRepositoryInterface } from './interfaces/theory-notebook.repository.interface';

@Injectable()
export class TheoryNotebookRepository
  extends BaseAbstractRepository<TheoryNotebookEntity>
  implements TheoryNotebookRepositoryInterface
{
  constructor(
    @InjectRepository(TheoryNotebookEntity)
    private readonly theoryNotebookRepository: Repository<TheoryNotebookEntity>,
  ) {
    super(theoryNotebookRepository);
  }
}
