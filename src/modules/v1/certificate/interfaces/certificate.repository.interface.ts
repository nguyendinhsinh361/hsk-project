import { BaseInterfaceRepository } from '../../../../base/mysql/base.interface.repository';
import { CertificateEntity } from '../entities/certificate.entity';
export type CertificateRepositoryInterface =
  BaseInterfaceRepository<CertificateEntity>;
