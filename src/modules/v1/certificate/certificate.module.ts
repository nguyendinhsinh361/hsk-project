import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware } from '../../../middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateService } from './certificate.service';
import { CertificateRepository } from './certificate.reponsitory';
import { CertificateEntity } from './entities/certificate.entity';
import { AuthModule } from '../../../modules/auth/auth.module';
import { CertificateController } from './certificate.controller';
import { LimitedRequestsMiddleware } from '../../../middleware/limitedRequests.middleware';
import { CertificateTimeModule } from '../certifiacte-time/certificate-time.module';

@Module({
  imports: [TypeOrmModule.forFeature([CertificateEntity]), AuthModule, CertificateTimeModule],
  controllers: [CertificateController],
  providers: [CertificateService, CertificateRepository],
  exports: [CertificateService, CertificateRepository],
})
export class CertificateModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware, LimitedRequestsMiddleware)
      .forRoutes(
        { path: 'certificate', method: RequestMethod.POST},
        { path: 'certificate/notify', method: RequestMethod.GET}
      );
    }
}
