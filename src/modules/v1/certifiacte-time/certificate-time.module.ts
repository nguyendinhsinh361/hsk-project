import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateTimeService } from './certificate-time.service';
import { CertificateTimeEntity } from './entities/certificate-time.entity';
import { CertificateTimeRepository } from './certificate-time.reponsitory';
import { SystemModule } from '../../../modules/system/system.module';

@Module({
  imports: [TypeOrmModule.forFeature([CertificateTimeEntity]), SystemModule],
  controllers: [],
  providers: [CertificateTimeService, CertificateTimeRepository],
  exports: [CertificateTimeService, CertificateTimeRepository],
})
export class CertificateTimeModule {}
