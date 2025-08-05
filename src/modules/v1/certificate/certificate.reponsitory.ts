import { BaseAbstractRepository } from '../../../base/mysql/base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificateEntity } from './entities/certificate.entity';
import { CertificateRepositoryInterface } from './interfaces/certificate.repository.interface';

@Injectable()
export class CertificateRepository
  extends BaseAbstractRepository<CertificateEntity>
  implements CertificateRepositoryInterface
{
  constructor(
    @InjectRepository(CertificateEntity)
    private readonly certificateRepository: Repository<CertificateEntity>,
  ) {
    super(certificateRepository);
  }
}
