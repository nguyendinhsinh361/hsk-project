import { BaseAbstractRepository } from "../../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { QuestionsEvaluateLevelEntity } from "./entities/question-evaluate-level.entity";
import { QuestionsEvaluateLevelRepositoryInterface } from "./interfaces/question-evaluate-level.repository.interface";

@Injectable()
export class QuestionsEvaluateLevelRepository
  extends BaseAbstractRepository<QuestionsEvaluateLevelEntity>
  implements QuestionsEvaluateLevelRepositoryInterface
{
    constructor(
        @InjectRepository(QuestionsEvaluateLevelEntity)
        private readonly questionsEvaluateLevelRepository: Repository<QuestionsEvaluateLevelEntity>,
      ) {
        super(questionsEvaluateLevelRepository);
      }
}
