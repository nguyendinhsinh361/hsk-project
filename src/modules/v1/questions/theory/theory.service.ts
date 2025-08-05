import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TheoryErrorRepository } from './theory.repository';
import { TheoryReportDto } from './dtos/theory-report.dto';
import { IResponse } from '../../../../common/interfaces/response.interface';
import * as Sentry from "@sentry/node";
@Injectable()
export class TheoryErrorService {
    constructor(
        private readonly theoryErrorRepository: TheoryErrorRepository,
    ) {}
    async reportError(user_id: string, theoryReportDto: TheoryReportDto) {
        try {
            const dataCreate = {
                userId: user_id,
                ...theoryReportDto
            }
            const theoryReportCurrent = await this.theoryErrorRepository.create(dataCreate)
            const dataResponse: IResponse = {
                message: `Create new report for theory successfully!`,
                data: theoryReportCurrent,
            };
            return dataResponse
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
        }
    }
}