import { BaseAbstractRepository } from "../../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { QuestionCommentEntity } from "./entities/comment.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { QuestionCommentRepositoryInterface } from "./interfaces/comment.repository.interface";
import { PaginateCommentFilterDto } from "../../../../common/dtos/paginate.dto";

@Injectable()
export class QuestionCommentRepository
  extends BaseAbstractRepository<QuestionCommentEntity>
  implements QuestionCommentRepositoryInterface
{
    constructor(
        @InjectRepository(QuestionCommentEntity)
        private readonly questionCommentRepository: Repository<QuestionCommentEntity>,
      ) {
        super(questionCommentRepository);
      }

    async getAllWithQuestionId(questionId: string, paginateDto: PaginateCommentFilterDto) {
      const {page, limit, filter} = paginateDto

      const queryBuilder = this.questionCommentRepository.createQueryBuilder('questions_comments');
      if (questionId) {
        queryBuilder.where('questions_comments.parent_id = :parentId', { parentId: 0 });
        queryBuilder.andWhere('questions_comments.question_id = :questionId', { questionId });
      }
      if(!filter) {
        queryBuilder.orderBy('created_at', 'DESC');
      } else {
        queryBuilder.orderBy('`like`', 'DESC');
      }
  
      queryBuilder.take(limit).skip((page - 1) * limit);
  
      return await queryBuilder.getMany();
    }

    async getAllWithCommentId(commentId: string, limit: number = 10, page: number = 1) {
      const queryBuilder = this.questionCommentRepository.createQueryBuilder('questions_comments');
      if (commentId) {
        queryBuilder.where('questions_comments.parent_id = :commentId order by created_at desc', { commentId });
      }
  
      queryBuilder.take(limit).skip((page - 1) * limit);
  
      return await queryBuilder.getMany();
    }

    async getTotalComment(questionId: number) {
      const queryBuilder = this.questionCommentRepository.createQueryBuilder('questions_comments');
      if (questionId) {
        queryBuilder.where('questions_comments.question_id = :questionId', { questionId });
      }
      return await queryBuilder.getCount();
    }
}
