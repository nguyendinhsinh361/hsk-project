import { AuthRepository } from './auth.repository';
import { Injectable } from '@nestjs/common';
import { AccessTokenDTO } from './dtos/token.dto';
import { JwtService } from '@nestjs/jwt';
import { Like, Not } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  genPrefixHSKToken(userId: any) {
    return `${userId}.`;
  }

  async getUserId(createUserDto: AccessTokenDTO) {
    return this.authRepository.findByCondition(createUserDto);
  }

  async removeToken(token: string) {
    return this.authRepository.delete(token);
  }

  async createdToken(user_id: number, token: string, ttl = 3153600000) {
    const result =  await this.authRepository.create({
      user_id: user_id,
      id: token,
      ttl: ttl,
    });
    return result
  }

  async generateToken(payload: any): Promise<string> {
    const prefixHSKToken = this.genPrefixHSKToken(payload.id);
    const token = await this.jwtService.signAsync(payload, {
      // Bỏ qua 'iat' bằng cách dùng `noTimestamp: true`
      noTimestamp: true,
      // Không cung cấp `expiresIn` để tránh thêm `exp`
    });
    return `${prefixHSKToken}${token}`;
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const tokenRemovePrefix = token.substring(token.indexOf('.') + 1);
      const result = await this.jwtService.verifyAsync(tokenRemovePrefix);
      console.log(result);
      return result;
    } catch (err) {
      throw new Error('Token không hợp lệ');
    }
  }

  async decodeToken(token: string): Promise<any> {
    const tokenRemovePrefix = token.substring(token.indexOf('.') + 1);
    const result = await this.jwtService.decode(tokenRemovePrefix);
    console.log(result);
    return result;
  }

  async findTotalNewFormatTokenOfUser(user_id: string) {
    const prefixHSKToken = this.genPrefixHSKToken(user_id);
    const totalNewFormatToken = await this.authRepository.findAll({
      where: {
        id: Like(`${prefixHSKToken}%`),
      },
      order: {
        id: 'DESC',
      },
      select: ['id', 'ttl', 'user_id'],
    });
    return totalNewFormatToken;
  }

  async getAllOldTokenOfUser(userId) {
    const prefixHSKToken = this.genPrefixHSKToken(userId);
    return this.authRepository.findAll({
      where: {
        user_id: +userId,
        id: Not(Like(`${prefixHSKToken}%`)),
      },
    });
  }

  async getAllNewFormatTokenOfUser(userId) {
    const prefixHSKToken = this.genPrefixHSKToken(userId);
    return this.authRepository.findAll({
      where: {
        user_id: +userId,
        id: Like(`${prefixHSKToken}%`),
      },
      order: {
        created: 'DESC',
      },
    });
  }

  async getAllTokenOfUser(userId) {
    return this.authRepository.findAll({
      where: {
        user_id: +userId,
      },
      order: {
        created: 'DESC',
      },
    });
  }
}
