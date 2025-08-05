import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TheoryLessonRepositoryInterface } from './interfaces/theory-lesson.repository.interface';
import { TheoryLessonEntity } from './entities/theory-lesson.entity';

@Injectable()
export class TheoryLessonRepository
  extends BaseAbstractRepository<TheoryLessonEntity>
  implements TheoryLessonRepositoryInterface
{
  constructor(
    @InjectRepository(TheoryLessonEntity)
    private readonly theoryLessonRepository: Repository<TheoryLessonEntity>,
  ) {
    super(theoryLessonRepository);
  }
}
