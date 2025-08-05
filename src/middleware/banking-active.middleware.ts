import { HttpException, HttpStatus, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from 'express';

@Injectable()
export class BankingActiveKeyMiddleware implements NestMiddleware {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    async use(req: any, res: any, next: (error?: any) => void) {
        const bankingActiceKey = this.configService.get<string>(
            'app.banking_key_active',
          )
        const token = req.headers.authorization;
        if (!token) {
            throw new HttpException('Please enter unauthorized.', HttpStatus.UNAUTHORIZED)
        }
        const findSupperKey = bankingActiceKey == token
        if(!findSupperKey) throw new HttpException('Banking Active key is not unauthorized.', HttpStatus.FORBIDDEN)
        req.banking_key_active = bankingActiceKey
        next();
    }
}