import { BaseInterfaceRepository } from '../../../../base/mysql/base.interface.repository';
import { CertificateTimeEntity } from '../entities/certificate-time.entity';
export type CertificateTimeRepositoryInterface =
  BaseInterfaceRepository<CertificateTimeEntity>;
