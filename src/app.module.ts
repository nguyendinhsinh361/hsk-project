import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import {
  MiddlewareConsumer,
  Module,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import { DatabaseChatGPTConfig, DatabaseMySQLConfig } from './config/mysql';
import { ConfigModule } from '@nestjs/config';
import { ConfigGlobal } from './config/configGlobal';
import { AccountModule } from './modules/v1/user/account/account.module';
import { PurchaseModule } from './modules/v1/purchase/purchase.module';
import { DeviceModule } from './modules/v1/device/device.module';
import { SystemModule } from './modules/system/system.module';
import { PracticeWritingModule } from './modules/v1/practice-writing/practice-writing.module';
import { CertificateModule } from './modules/v1/certificate/certificate.module';
import { TheoryErrorModule } from './modules/v1/questions/theory/theory.module';
import { ScoringModule } from './modules/v1/scoring/scoring.module';
import { ReasonCancelModule } from './modules/v1/reason-cancel/reason-cancel.module';
import { AIResultModule } from './modules/v1/ai-result/ai-result.module';
import { UserSynchronizedPracticeModule } from './modules/v1/users-synchronized-practice/users-synchronized-practice.module';
import { AwardsModule } from './modules/v1/awards/awards.module';
import { EventModule } from './modules/v1/event/event.module';
import { QuestionTestModule } from './modules/v1/question-test/question-test.module';
import { UserTrackingModule } from './modules/v1/user-tracking/user-tracking.module';
import { TheoryNotebookModule } from './modules/v1/theory-notebook/theory-notebook.module';
import { TheoryLessonModule } from './modules/v1/theory-lesson/theory-lesson.module';
import { RoutesUserModule } from './modules/v1/roadmap/routes-user/routes-user.module';
import { EbookModule } from './modules/v1/ebook/ebook.module';
import { WrapUpModule } from './modules/v1/wrapup/wrapup.module';
import { DivinationModule } from './modules/v1/divinations/divination.module';
// import { RedisModule } from './config/cache';

@Module({
  imports: [
    ConfigModule.forRoot(ConfigGlobal),
    SystemModule,
    AuthModule,
    PurchaseModule,
    DeviceModule,
    AccountModule,
    PracticeWritingModule,
    PurchaseModule,
    CertificateModule,
    TheoryErrorModule,
    ScoringModule,
    ReasonCancelModule,
    AIResultModule,
    UserSynchronizedPracticeModule,
    AwardsModule,
    EventModule,
    QuestionTestModule,
    TheoryNotebookModule,
    TheoryLessonModule,
    UserTrackingModule,
    RoutesUserModule,
    EbookModule,
    WrapUpModule,
    // RedisModule,
    DatabaseMySQLConfig,
    // DatabaseChatGPTConfig,

    DivinationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        res.setTimeout(500000, () => {
          console.log('Request has timed out.');
          res.sendStatus(408);
        });
        next();
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
