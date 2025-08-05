import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AIResultRepository } from './ai-result.reponsitory';
import { AIRessultDto, AIRessultUpdateDto } from './dtos/ai-result.dto';
import { IResponse } from '../../../common/interfaces/response.interface';
import * as Sentry from "@sentry/node";

@Injectable()
export class AIResultService {
    constructor(
        private readonly aIResultRepository: AIResultRepository,
    ) {}

    async getMultipleAIResult(condition: any){
        return this.aIResultRepository.findAll(condition)
    }
    
    async createAIResult(input: AIRessultDto){
        return this.aIResultRepository.create(input)
    }

    async updateAIResult(input: AIRessultUpdateDto, user_id: string){
        try {
            const allIdsAIResusltForUserRaw = await this.aIResultRepository.findAll({
                select: ["id"],
                where: { 
                    userId: user_id
                  }
            })
            const allIdsAIResusltForUser = allIdsAIResusltForUserRaw.map(ele => ele.id)
            const {aiScoringIds, historyId} = input
            const response: IResponse = {
                message: "Update history for all questions successfully.",
                data: {}
            }
            const checkIdsMatch = aiScoringIds.every(ele => allIdsAIResusltForUser.includes(ele));

            if(checkIdsMatch) {
                for (const id of aiScoringIds) {
                    await this.aIResultRepository.update(id, {historyId})
                }
                return response
            }
            
            response.message = "The Ids you transmitted are not satisfied."
            throw new HttpException(response, HttpStatus.BAD_REQUEST)
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            const response: IResponse = {
                message: "Update history for all questions failed.",
                data: {}
            }
            throw new HttpException(response, HttpStatus.BAD_REQUEST)  
        }
    }
}