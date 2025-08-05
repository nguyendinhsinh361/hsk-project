import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import { CertificateTimeRepository } from './certificate-time.reponsitory';
import { IResponseCertificate } from '../certificate/interfaces/reponse-certificate.interface';
import { SystemService } from '../../../modules/system/system.service';
import * as Sentry from "@sentry/node";
@Injectable()
export class CertificateTimeService {
  constructor(
    private readonly certificateTimeRepository: CertificateTimeRepository,
    private readonly systemService: SystemService
  ) {}

  async createCertificateTime() {
    try {
      const certificateTimeActive = await this.certificateTimeRepository.findByCondition({active: 1})
      let startTime = 1704868878000
      let endTime = 1707547278000
      if(certificateTimeActive) {
        startTime = +certificateTimeActive.startTime
        endTime = +certificateTimeActive.endTime
      }
      const dataResponse: IResponseCertificate = {
        message: 'Get certificate time successfully.',
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
