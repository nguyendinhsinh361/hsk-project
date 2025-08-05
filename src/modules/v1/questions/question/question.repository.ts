import { BaseAbstractRepository } from "../../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { QuestionEntity } from "./entities/question.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { QuestionRepositoryInterface } from "./interfaces/question.repository.interface";
import { FilterOption } from "../../practice-writing/enums/filterOption.enum";
import { QuestionPracticeDto } from "./dtos/question-practice.dto";
import { KindPracticeQuestionEnum } from "../../practice-writing/enums/kindQuestion.enum";

@Injectable()
export class QuestionRepository
  extends BaseAbstractRepository<QuestionEntity>
  implements QuestionRepositoryInterface
{
    constructor(
      @InjectRepository(QuestionEntity)
      private readonly questionRepository: Repository<QuestionEntity>,
    ) {
      super(questionRepository);
    }

    async getAllQuestionOption(user_id: string, kind: string, limit: number = 10, page: number = 1, filter: string) {
      const queryBuilder = this.questionRepository.createQueryBuilder('questions');
      if (kind) {
        queryBuilder.where('questions.kind = :kind', { kind }).andWhere('questions.check_admin IN (1,3,4)');
      }
      if(limit && page) {
        queryBuilder.take(limit).skip((page - 1) * limit);
      }

      if(!filter)
        queryBuilder.addOrderBy('questions.created_at', 'DESC');
      else if (filter == FilterOption.COMMENT) {
        queryBuilder.addOrderBy('questions.total_comment', 'DESC');
      }
      else if (filter == FilterOption.LIKE) {
        queryBuilder.addOrderBy('questions.total_like', 'DESC');
      }
      else if (filter == FilterOption.USER) {
        queryBuilder.andWhere('questions.source LIKE :source order by created_at desc',  {source: `%premium-${user_id}%`});
      }
      return await queryBuilder.getMany();
    }

    async checkExistQuestion(ids: string[]) {
      
      const questionExist = await this.questionRepository
        .createQueryBuilder("questions")
        .select("questions.id")
        .where("questions.id IN (:...ids)", {ids})
        .getMany()
      return questionExist
    }

    async getQuestionPracticeRandom(questionPracticeDto: QuestionPracticeDto) {
      const {device_id, platforms, kind, lang, level, limit} = questionPracticeDto
      console.log(limit)
      let kindFinal = [kind]
      if(kind == KindPracticeQuestionEnum.KIND_410003) {
        kindFinal = [KindPracticeQuestionEnum.KIND_410003_1, KindPracticeQuestionEnum.KIND_410003_2]
      }
      if(kind == KindPracticeQuestionEnum.KIND_420003) {
        kindFinal = [KindPracticeQuestionEnum.KIND_420003_1, KindPracticeQuestionEnum.KIND_420003_2]
      }
      if(kind == KindPracticeQuestionEnum.KIND_510002) {
        kindFinal = [KindPracticeQuestionEnum.KIND_510002_1, KindPracticeQuestionEnum.KIND_510002_2]
      }
      if(kindFinal.length === 1) {
        const listEventCurrent = await this.questionRepository.createQueryBuilder("question")
          .distinct(true)
          .where("question.kind = :kind", { kind: kindFinal[0] })
          .andWhere("question.level = :level", { level })
          .andWhere("question.checkAdmin IN (1,3,4)")
          .orderBy("RAND()")
          .take(limit)
          .getMany();
        return listEventCurrent
      } else {
        const limitForKind_1 = parseInt((limit/2).toString())
        const limitForKind_2 = limit - limitForKind_1
        let listEventCurrent_1 = []
        let listEventCurrent_2 = []
        if(limitForKind_1) {
          listEventCurrent_1 = await this.questionRepository.createQueryBuilder("question")
          .distinct(true)
          .where("question.kind = :kind", { kind: kindFinal[0] })
          .andWhere("question.level = :level", { level })
          .andWhere("question.checkAdmin IN (1,3,4)")
          .orderBy("RAND()")
          .take(limitForKind_1)
          .getMany();
        }
        
        if(listEventCurrent_2) {
          listEventCurrent_2 = await this.questionRepository.createQueryBuilder("question")
            .distinct(true)
            .where("question.kind = :kind", { kind: kindFinal[1] })
            .andWhere("question.level = :level", { level })
            .andWhere("question.checkAdmin IN (1,3,4)")
            .orderBy("RAND()")
            .take(limitForKind_2)
            .getMany();
        }
        return [...listEventCurrent_1, ...listEventCurrent_2]
      }
    }
}
