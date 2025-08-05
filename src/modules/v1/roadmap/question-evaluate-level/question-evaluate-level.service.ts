import { Injectable } from '@nestjs/common';
import { QuestionsEvaluateLevelRepository } from './question-evaluate-level.repository';
import { TheoryLevelEnum } from '../../theory-notebook/enums/theoryNotebook.enum';
import { RoutesUserDetailDto, RoutesUserDto } from '../routes-user/dtos/routes-user.dto';
import { ResultEvaluateLevelDto } from './dtos/result-evaluate-level.dto';

@Injectable()
export class QuestionsEvaluateLevelService {
    constructor(private readonly questionsEvaluateLevelRepository: QuestionsEvaluateLevelRepository) {}
    
    async getExamEvaluate(user_id: string, input: RoutesUserDetailDto) {
        const {level} = input
        const questionTestDetail = await this.questionsEvaluateLevelRepository.query(`select * from questions_evaluate_level WHERE level LIKE '${level}%' ORDER BY  RAND() LIMIT 1`)
        return {...questionTestDetail[0], content: JSON.parse(questionTestDetail[0].content)}
    }

    async createResultEvaluateExamForUser(user_id: string, input: ResultEvaluateLevelDto) {
        const {level, detail} = input
        await this.questionsEvaluateLevelRepository.query(`insert into result_evaluate_level set id_user = ?, level = ?, result = ?`, [+user_id, +level, JSON.stringify(detail)])
    }

}