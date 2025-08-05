import { Injectable } from '@nestjs/common';
import { UserSynchronizedPracticeRepository } from './users-synchronized-practice.reponsitory'; 
import { IFormatResponseOldHistory } from './interfaces/users-synchronized-practice.interface';
import { AnswerEvaluationOutputDto } from '../scoring/dtos/scoring-output.dto';
import { AIResultService } from '../ai-result/ai-result.service';
import { UpdateHistoryDto } from './dtos/users-synchronized-practice.dto';
import * as Sentry from "@sentry/node";
@Injectable()
export class UserSynchronizedPracticeService {
    constructor(
        private readonly userSynchronizedPracticeRepository: UserSynchronizedPracticeRepository,
        private readonly aIResultService: AIResultService,
    ) {}
    async getUserSynchronizedPractice(user_id: string, historyId: string){
        try {
            const historyDetail = await this.userSynchronizedPracticeRepository.findOneById(historyId)
            const historyResponseOld: IFormatResponseOldHistory = {
                Err: null,
                User: {
                    content: JSON.parse(historyDetail.content),
                    result: JSON.parse(historyDetail.result),
                    sync_type: historyDetail.syncType
                }
            }
            const aiResultRaw = await this.aIResultService.getMultipleAIResult({
                select: ["id", "questionId", "result"],
                where: { 
                    historyId: historyId
                },
                order: {
                    createdAt: "DESC"
                }
                
            })
            if(aiResultRaw) {
                const uniqueAiResult= [];
                let seenQuestionIds = new Set();

                for (let item of aiResultRaw) {
                    if (!seenQuestionIds.has(item.questionId)) {
                        uniqueAiResult.push(item);
                        seenQuestionIds.add(item.questionId);
                    }
                }
                const aiResultFinal = uniqueAiResult.map(ele => {
                    return {
                        questionId: ele.questionId,
                        result: JSON.parse(ele.result),
                        status: (JSON.parse(ele.result)).hasOwnProperty('isNotContainsTopicWord') ? false : true
                    }
                })
    
                return {
                    ...historyResponseOld,
                    aiResult: aiResultFinal
                }
            }
            return historyResponseOld
        } catch (error) {
            Sentry.captureException(error);
            return {}
        }
    }

    async updateUserSynchronizedPractice(updateHistoryDto: UpdateHistoryDto, user_id: string, historyId: string) {
        try {
            const historyDetail = await this.userSynchronizedPracticeRepository.findOne({
                where: {
                  userId: user_id,
                  id: historyId
                },
                order: {
                  created_at: "DESC"
                },
                take: 1
              });
            const result = JSON.parse(historyDetail.result)
            result.scoreWriting = parseInt(updateHistoryDto.scoringWriting) ? parseInt(updateHistoryDto.scoringWriting) : 0
            const resultText = JSON.stringify(result)
            await this.userSynchronizedPracticeRepository.update(historyId, {result: resultText})
            const response = {
                "Err": null,
                "status": 200,
                "msg": "Success!",
                "User": {
                  "id": +historyDetail.id,
                  "user_id": +historyDetail.userId,
                  "level": +historyDetail.level,
                  "key_id": historyDetail.keyId,
                  "result": result
                }
              }
            return response
        } catch (error) {
            Sentry.captureException(error);
            const response = {
                "Err": null,
                "status": 400,
                "msg": "Failed!",
                "User": {}
              }
            return response
        }
    }
}