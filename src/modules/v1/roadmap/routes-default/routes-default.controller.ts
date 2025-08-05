import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, Res, SerializeOptions, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation, ApiConsumes} from "@nestjs/swagger";
import { UserId } from '../../../../decorators/get-current-user-id.decorator';
import { RoutesDefaultService } from "./routes-default.service";
import * as Sentry from "@sentry/node";
import { RoutesDefaultDto } from "./dtos/routes-default.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { RouteLevelEnum } from "./enums/route-level.enum";


@ApiTags('Roadmap')
@Controller("roadmap")
export class RoutesDefaultController {
    constructor(
        private readonly routesDefaultService: RoutesDefaultService
    ) {}

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Lộ trình đang tạo đã tồn tại' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Tạo mới các lộ trình mặc định'})
    @ApiConsumes('multipart/form-data')
    @Post('create-route-default')
    @UseInterceptors(FileInterceptor('routeDefault'))
    async createRoadmapDefault(
        @UploadedFile() file: Express.Multer.File, 
        @Body() routeDefaultDto: RoutesDefaultDto
    ){
        try {
            if (!file) {
                throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
            }
            const level = file.originalname.split(".")[0]
            const jsonData = JSON.parse(file.buffer.toString());
            const checkRouteDefault = await this.routesDefaultService.getDetailRoutesDefault(+level)
            if(checkRouteDefault) throw new HttpException('Lộ trình đang tạo đã tồn tại', HttpStatus.CONFLICT)
            await this.routesDefaultService.createNewRoutesDefault(jsonData, +level)
            return { message: 'Success!' }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}