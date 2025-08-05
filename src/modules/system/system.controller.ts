import { Body, Controller, Delete, Get, HttpException, HttpStatus, HttpCode, Post, Req, Res, SerializeOptions } from "@nestjs/common";
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import { Response } from "express"
import { SystemService } from "./system.service";
import { GetSuperKeyName, GetSupperKey } from "../../decorators/get-supper-key.decorator";


@ApiTags('system')
@Controller()
export class SystemController {
    constructor(
        private readonly systemService: SystemService
    ){}

    @Get('system/info')
    async time() {
        return {
            time: this.systemService.time()
        }
    }

    @Get('system/supper-key')
    async getSupperKey(@GetSupperKey() key_use: string, @GetSuperKeyName() name: string) {
        return await this.systemService.createSupperPassword(key_use, name)
    }
}