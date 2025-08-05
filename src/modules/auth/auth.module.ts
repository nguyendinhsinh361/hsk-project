import { AuthController } from './auth.controller';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserIdMiddleware } from '../../middleware/auth.middleware';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessToken } from './entities/token.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessToken]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return ({
          secret: configService.get<string>('app.hsk_jwt_token_secret') || "38af9c9afc104fa3a218e70e7359d906",
        })
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy],
  exports: [AuthService, AuthRepository]
})
export class AuthModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(UserIdMiddleware)
        .forRoutes(
            { path: 'auth', method: RequestMethod.POST }
        )
}
}