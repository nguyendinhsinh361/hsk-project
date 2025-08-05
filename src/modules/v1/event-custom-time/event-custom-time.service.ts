import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import { EventCustomTimeRepository } from './event-custom-time.reponsitory';
import { IResponseCertificate } from '../certificate/interfaces/reponse-certificate.interface';
import { SystemService } from '../../system/system.service';
import * as Sentry from "@sentry/node";
const EVENT_CUSTOM = [
  {
    "eventId": "TP3DAM3C1",
    "eventName": "Sự kiện dùng thử Premium 3 ngày + 3 lượt chấm AI",
  }
]

@Injectable()
export class EventCustomTimeService {
  constructor(
    private readonly eventCustomTimeRepository: EventCustomTimeRepository,
    private readonly systemService: SystemService
  ) {}

  async getTimeActiveTrial() {
    try {
      const eventCustomActive = await this.eventCustomTimeRepository.findByCondition({active: 1, eventId: EVENT_CUSTOM[0].eventId})
      let startTime = 1718278113000
      let endTime = 1719791999000
      if(eventCustomActive) {
        startTime = +eventCustomActive.startTime
        endTime = +eventCustomActive.endTime
      }
      const dataResponse: IResponseCertificate = {
        message: 'Get event custom time successfully.',
        data: {
          startTime: startTime,
          endTime: endTime,
          serverTime: +await this.systemService.time(),
        },
      };
      return dataResponse
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
