import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventPrizeRepository } from './event-prize.reponsitory';

@Injectable()
export class EventPrizeService {
    constructor(
        private readonly eventPrizeRepository: EventPrizeRepository,
    ) {}

    async createMultipleEventPrize(data) {
        return await this.eventPrizeRepository.create(data)
    }
}