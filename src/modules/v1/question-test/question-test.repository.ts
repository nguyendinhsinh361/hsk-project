import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { QuestionTestEntity } from "./entities/question-test.entity";
import { QuestionTestRepositoryInterface } from './interfaces/question-test.repository.interface';
import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';

@Injectable()
export class QuestionTestRepository
  extends BaseAbstractRepository<QuestionTestEntity>
  implements QuestionTestRepositoryInterface
{
    constructor(
      @InjectRepository(QuestionTestEntity)
      private readonly questionTestRepository: Repository<QuestionTestEntity>,
    ) {
      super(questionTestRepository);
    }

}
