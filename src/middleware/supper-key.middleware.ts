import { HttpException, HttpStatus, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from 'express';

export const SUPPER_KEY = [
    {
        "name": "Sinh_BE",
        "key_use": "ecc18080ccef4afabdc7079bee9842abEUP"
    },
    {
        "name": "Vuong_BE",
        "key_use": "387069385e6d43ccb893b8ef153b1203EUP"
    },
    {
        "name": "Admin",
        "key_use": "b2a9ac87f4e5424e843494f214180887EUP"
    },
    {
        "name": "Truong_FE",
        "key_use": "397157ec21d1400f986df2478425672bEUP"
    },
    {
        "name": "Tuan_FE",
        "key_use": "ffa23fc5a03047a29d31cc37e11a2c2aEUP"
    },
]

@Injectable()
export class SupperKeyMiddleware implements NestMiddleware {
    constructor(
    ) { }

    async use(req: any, res: any, next: (error?: any) => void) {
        const token = req.headers.authorization;
        if (!token) {
            throw new HttpException('Supper key is not unauthorized.', HttpStatus.UNAUTHORIZED)
        }
        const findSupperKey = SUPPER_KEY.find(ele => ele.key_use == token)
        if(!findSupperKey) throw new HttpException('Supper key is not unauthorized.', HttpStatus.UNAUTHORIZED)
        req.key_use = findSupperKey.key_use
        req.name = findSupperKey.name
        next();
    }
}