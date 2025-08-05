import { BaseAbstractRepository } from "../../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { QuestionCommentReportEntity } from "./entities/comment-report.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { QuestionCommentReportRepositoryInterface } from "./interfaces/comment-report.repository.interface";

@Injectable()
export class QuestionCommentReportRepository
  extends BaseAbstractRepository<QuestionCommentReportEntity>
  implements QuestionCommentReportRepositoryInterface
{
    constructor(
        @InjectRepository(QuestionCommentReportEntity)
        private readonly questionCommentReportRepository: Repository<QuestionCommentReportEntity>,
      ) {
        super(questionCommentReportRepository);
      }
}
