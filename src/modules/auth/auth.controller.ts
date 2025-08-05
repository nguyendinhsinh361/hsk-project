import { Controller, Post, Body, Injectable, Req } from '@nestjs/common';
import { AccessTokenDTO } from './dtos/token.dto';
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import { UserId } from '../../decorators/get-current-user-id.decorator';

@ApiTags('Auth')
@Controller()
export class AuthController {
//   constructor(private readonly userService: UserService) {}

  @Post('auth')
  async auth(@UserId() user_id: any, @Body() accessToken: AccessTokenDTO): Promise<any> {
    return {user_id:user_id};
  }
}