import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Res } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { UserId } from 'src/decorators/get-current-user-id.decorator';
import { Response } from "express"
import { UserTrackingService } from "./user-tracking.service";
import { UserTrackingDto, OutputUserDto } from "./dtos/user-tracking.dto";
import * as Sentry from "@sentry/node";
@ApiTags('User Tracking')
@Controller("user")
export class UserTrackingController {
    constructor(
        private UserTrackingService: UserTrackingService
    ) { }
    @ApiResponse({ status: HttpStatus.OK, description: 'Tạo thông tin user-tracking thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
    @ApiOperation({
        summary: "Tạo thông tin user-tracking",
        description: `Tag: Attention_Practice100, Attention_Exam2.\n
        Default: {
            "content": [
                {
                    "tag": "Attention_Unit3"
                },
                {
                    "tag": "Attention_Game1"
                }
            ]
        }
        `
    })
    @Post('userTracking')
    async userTracking(@Body() input: UserTrackingDto, @UserId() userId, @Res() res: Response): Promise<any> {
        try {
            const resultQuery = await this.UserTrackingService.createUserTracking(userId, input.content)
            return res.status(HttpStatus.OK).json(new OutputUserDto(resultQuery))
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                console.log('error1', error);
                throw error;
            } else {
                console.log('error2', error);
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

}