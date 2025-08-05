import { HttpException, HttpStatus, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from 'express';
import { AuthService } from "../modules/auth/auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserIdMiddleware implements NestMiddleware {
    constructor(
        private authService: AuthService
    ) { }

    async use(req: any, res: any, next: (error?: any) => void) {
        // Lấy token từ header Authorization
        const token = req.headers.authorization;
        // Kiểm tra xem token có hợp lệ không
        if (!token) {
            throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED)
        }
        const user = await this.authService.getUserId({"id": token})

        if (!user) {
            throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED)
        }
        req.user_id = user.user_id
        req.token = token
        // Tiếp tục yêu cầu
        next();
    }
}

@Injectable()
export class UserIdMiddlewareOption implements NestMiddleware {
    constructor(
        private authService: AuthService
    ) { }

    async use(req: any, res: any, next: (error?: any) => void) {
        const token = req.headers.authorization;

        if(!token) {
            next();
        }
        else {
            const user = await this.authService.getUserId({"id": token})
            if (!user) {
                throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED)
            }
            req.user_id = user.user_id
            // Tiếp tục yêu cầu
            next();
        }
    }
}

@Injectable()
export class UserIdNotAuthMiddleware implements NestMiddleware {
    constructor(
        private authService: AuthService
    ) { }

    async use(req: any, res: any, next: (error?: any) => void) {
        // Lấy token từ header Authorization
        const token = req.headers.authorization;
        // Kiểm tra xem token có hợp lệ không
        if (!token) {
            req.user_id = ""
            next();
        }else{
            const user = await this.authService.getUserId({"id": token})
            if (!user) {
                next();
            }
            req.user_id = user.user_id
            // Tiếp tục yêu cầu
            next();
        }
    }
}


@Injectable()
export class SupportAdminMiddleware implements NestMiddleware {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    async use(req: any, res: any, next: (error?: any) => void) {
        const token = req.headers.authorization;
        if (!token) {
            throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED)
        }
        const supportAdminKey = this.configService.get<string>('app.supportAdminKey')
        if (supportAdminKey !== token) {
            throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED)
        }
        next();
    }
}