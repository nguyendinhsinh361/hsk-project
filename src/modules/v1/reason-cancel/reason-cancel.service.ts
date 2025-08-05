import { Injectable } from '@nestjs/common';
import { ReasonCancelRepository } from './reason-cancel.reponsitory'; 
import { ReasonCancelDto } from './dtos/reason-cancel.dto';

@Injectable()
export class ReasonCancelService {
    constructor(private readonly reasonCancelRepository: ReasonCancelRepository) {}
    
    async createReasonCancel(input: ReasonCancelDto){
        return this.reasonCancelRepository.create({"userId": input?.userId, "description": input.description})
    }

}