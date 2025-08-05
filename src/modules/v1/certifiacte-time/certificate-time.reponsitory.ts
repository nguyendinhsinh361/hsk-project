import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateTimeEntity } from './entities/certificate-time.entity';
import { CertificateTimeRepositoryInterface } from './interfaces/certificate-time.repository.interface';

@Injectable()
export class CertificateTimeRepository
  extends BaseAbstractRepository<CertificateTimeEntity>
  implements CertificateTimeRepositoryInterface
{
  constructor(
    @InjectRepository(CertificateTimeEntity)
    private readonly certificateTimeRepository: Repository<CertificateTimeEntity>,
  ) {
    super(certificateTimeRepository);
  }
}
