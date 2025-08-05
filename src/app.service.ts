import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Sentry from "@sentry/node";
@Injectable()
export class AppService implements OnModuleInit {
  private readonly SENTRY_SDK_DNS: any = "http://25d863a4ad4f8795748d2add34d52f09@sentry.eup.ai/24";
  private readonly ENVIRONMENTS: any = ["local", "production"];
  private readonly RELEASE: any = "migii-hsk-api-v2@1.0.0";
  async onModuleInit() {
    console.log('Sentry is initializing...');

    Sentry.init({
      dsn: this.SENTRY_SDK_DNS,
      environment: this.ENVIRONMENTS[1],
      release: this.RELEASE,
      tracesSampleRate: 1.0, // Capture 100% of the transactions
    });

    console.log('Sentry is initialized.');
  }
}
