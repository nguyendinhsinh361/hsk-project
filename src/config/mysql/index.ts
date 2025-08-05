import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DatabaseType } from 'typeorm';

export const DatabaseMySQLConfig = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    return {
      type: 'mysql' as DatabaseType,
      host: configService.get<string>('mysql.host'),
      port: parseInt(configService.get<string>('mysql.port')),
      username: configService.get<string>('mysql.username'),
      password: configService.get<string>('mysql.password'),
      database: configService.get<string>('mysql.database'),
      autoLoadEntities: true,
      synchronize: false,
      entities: [],
    } as TypeOrmModuleAsyncOptions;
  },
  inject: [ConfigService],
});


export const DatabaseChatGPTConfig = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    return {
      type: 'mysql' as DatabaseType,
      host: configService.get<string>('mysql.chatgpt_host'),
      port: parseInt(configService.get<string>('mysql.chatgpt_port')),
      username: configService.get<string>('mysql.chatgpt_username'),
      password: configService.get<string>('mysql.chatgpt_password'),
      database: configService.get<string>('mysql.chatgpt_database'),
      autoLoadEntities: true,
      synchronize: false,
      entities: [],
    } as TypeOrmModuleAsyncOptions;
  },
  inject: [ConfigService],
});