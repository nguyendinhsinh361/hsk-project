import { BaseAbstractRepository } from "../../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { QuestionCommentVoteEntity } from "./entities/comment-vote.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { QuestionCommentVoteRepositoryInterface } from "./interfaces/comment-vote.repository.interface";

@Injectable()
export class QuestionCommentVoteRepository
  extends BaseAbstractRepository<QuestionCommentVoteEntity>
  implements QuestionCommentVoteRepositoryInterface
{
    constructor(
        @InjectRepository(QuestionCommentVoteEntity)
        private readonly questionCommentVoteRepository: Repository<QuestionCommentVoteEntity>,
      ) {
        super(questionCommentVoteRepository);
      }
}
