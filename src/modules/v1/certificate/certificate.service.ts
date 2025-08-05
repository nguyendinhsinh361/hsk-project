import { IResponseCertificate } from './interfaces/reponse-certificate.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CertificateRepository } from './certificate.reponsitory';
import { CreateCertificateDto } from './dtos/creatCertificate.dto';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import { CertificateStatusEnum } from './enums/certificateStatusEnum.enum';
import { PaginateDto } from '../../../common/dtos/paginate.dto';
import { UpdateCertificateDto, UpdateImgCertificateDto } from './dtos/updateCertificate.dto';
import * as Sentry from "@sentry/node";
@Injectable()
export class CertificateService {
  constructor(
    private readonly certificateRepository: CertificateRepository,
    private readonly configService: ConfigService,
  ) {}

  async createCertificate(
    user_id: string,
    createCertificateDto: CreateCertificateDto,
    imagePath: string,
  ) {
    try {
      const fullImagePath = `${this.configService.get<string>(
        'app.domain',
      )}/${imagePath.replace(/\\/g, '/')}`;
      const certificateData = {
        userId: parseInt(user_id),
        ...createCertificateDto,
        share: +createCertificateDto.share,
        certificateImg: fullImagePath,
      };
      
      const newCertificate = await this.certificateRepository.create(
        certificateData,
      );
      const dataResponse: IResponseCertificate = {
        message: 'Create new certificate successfully',
        data: newCertificate,
      };
      return dataResponse;
    } catch (error) {
      Sentry.captureException(error);
      if (error instanceof HttpException) {
          throw error; 
      }
      await fs.unlink(imagePath);
      throw new HttpException(
        `Certificate of user with id: ${user_id} already exist. Please wait 30 days`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllCertificates(paginateDto: PaginateDto) {
    const {page, limit, search} = paginateDto
    try {
      const allCertificatesActive = await this.certificateRepository.findOption({
        where: [
          { active: 1},
          { active: 2},
        ],
        order: {
          createdAt: "DESC"
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      const allImgCertificates = allCertificatesActive.map(ele => ele.certificateImg)
      const dataResponse: IResponseCertificate = {
        message: 'Get all image of certificate successfully',
        data: allImgCertificates,
      };
      return dataResponse
    } catch (error) {
      Sentry.captureException(error);
      if (error instanceof HttpException) {
          throw error; 
      }
      throw new HttpException(
        `Get all image of certificate failed`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getNotificationnActive(user_id: string) {
    try {
      const certificateNewestOfUser = await this.certificateRepository.findOne({
        where: {
          userId: user_id
        },
        order: {
          createdAt: "DESC"
        },
        take: 1
      });
      if(!certificateNewestOfUser) {
        throw new HttpException(
          `Cannot find certificate of user`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const certificateInfo = {
        active: +certificateNewestOfUser.active,
        premiunTime: 0
      }
      if(+certificateNewestOfUser.active === CertificateStatusEnum.ACTIVE ||  +certificateNewestOfUser.active === CertificateStatusEnum.ACTIVE_PRCCESSED)
        certificateInfo.premiunTime = 30
      if(+certificateNewestOfUser.active === CertificateStatusEnum.ACTIVE) {
        await this.certificateRepository.update(certificateNewestOfUser.id, {active: CertificateStatusEnum.ACTIVE_PRCCESSED})
      }
      if(+certificateNewestOfUser.active === CertificateStatusEnum.DEACTIVE) {
        await this.certificateRepository.update(certificateNewestOfUser.id, {active: CertificateStatusEnum.DEACTIVE_PRCCESSED})
      }
      const dataResponse: IResponseCertificate = {
        message: 'Get notify of certificate successfully.',
        data: certificateInfo,
      };
      return dataResponse
    } catch (error) {
      throw new HttpException(
        `Get notify of certificate failed`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async activeCertificate(user_id: string, updateCertificateDto: UpdateCertificateDto) {
    try {
      const certificateNewestOfUser = await this.certificateRepository.findOne({
        where: {
          userId: user_id
        },
        order: {
          createdAt: "DESC"
        },
        take: 1
      });
      const updateCertificate =  await this.certificateRepository.update(certificateNewestOfUser.id, {active: updateCertificateDto.status})
        const dataResponse: IResponseCertificate = {
          message: 'Get notify of certificate successfully.',
          data: updateCertificate,
        };
      return dataResponse
    } catch (error) {
      Sentry.captureException(error);
      if (error instanceof HttpException) {
          throw error; 
      }
      throw new HttpException(
        `Update certificate detail failed`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateImgCertificate(user_id: string, imagePath: string, updateImgCertificateDto: UpdateImgCertificateDto) {
    try {
      const fullImagePath = `${this.configService.get<string>(
        'app.domain',
      )}/${imagePath.replace(/\\/g, '/')}`;
      const dataResponse: IResponseCertificate = {
        message: 'Update image for certifcate successfully.',
        data: fullImagePath,
      };
      return dataResponse
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}
