import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { UserIdMiddleware } from "../../../middleware/auth.middleware";
import { LimitedRequestsMiddleware } from "../../../middleware/limitedRequests.middleware";
import { ChatGPTService } from "./chatgpt.service";
import { HttpModule } from "@nestjs/axios";
import { ChatGPTAPIEnum } from "./enums/chatGPT.enum";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsageEntity } from "./entities/chatgpt-usage.entity";
import { ChatGPTUsageRepository } from "./chatgpt.reponsitory";
import { FileService } from "../file/file.service";
import * as http from 'http';
import * as https from 'https';
import { OpenAIService } from "../openai/openai.server";
import { DetailTasksService } from "../../../modules/helper/detail-tasks.service";
import { KeyValueService } from "../../../modules/helper/key-value.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([UsageEntity]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        maxBodyLength: Infinity,
        baseURL: ChatGPTAPIEnum.URL,
        headers: {
          Authorization: `Bearer ${configService.get<string>('chatGPT.key')}`,
          'Content-Type': 'application/json',
        },
        maxRedirects: 10,
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [ChatGPTService, ChatGPTUsageRepository, FileService, OpenAIService, DetailTasksService, KeyValueService],
  exports: [ChatGPTService, ChatGPTUsageRepository, FileService, DetailTasksService, KeyValueService]
})
export class ChatGPTModule {
}