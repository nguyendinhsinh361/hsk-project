import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UserIdMiddleware } from "../../../middleware/auth.middleware";
import { LimitedRequestsMiddleware } from "../../../middleware/limitedRequests.middleware";
import { AuthModule } from "../../auth/auth.module";
import { ScoringController } from "./scoring.controller";
import { ScoringService } from "./scoring.service";
import { ChatGPTModule } from "../chatgpt/chatgpt.module";
import { AIResultModule } from "../ai-result/ai-result.module";
import { OpenAIService } from "../openai/openai.server";
import { PurchaseModule } from "../purchase/purchase.module";
import { KeyValueService } from "../../../modules/helper/key-value.service";


@Module({
  imports: [AuthModule, ChatGPTModule, AIResultModule, PurchaseModule],
  controllers: [ScoringController],
  providers: [ScoringService, OpenAIService, KeyValueService],
  exports: [ScoringService]
})
export class ScoringModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware, LimitedRequestsMiddleware)
      .forRoutes(
        { path: 'scoring/hsk4/430002', method: RequestMethod.POST},
        { path: 'scoring/hsk5/530002', method: RequestMethod.POST},
        { path: 'scoring/hsk5/530003', method: RequestMethod.POST},
        { path: 'scoring/hsk6/630001', method: RequestMethod.POST},
      );
    }
}