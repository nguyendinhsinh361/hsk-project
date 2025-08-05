import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, Res, SerializeOptions } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation} from "@nestjs/swagger";
import { UserId } from "../../../decorators/get-current-user-id.decorator"
import { UserSynchronizedPracticeService } from "./users-synchronized-practice.service";
import { UpdateHistoryDto } from "./dtos/users-synchronized-practice.dto";

@ApiTags('User Synchronized Practice')
@Controller("user-synchronized-practice")
export class UserSynchronizedPracticeController {
    constructor(
        private readonly userSynchronizedPracticeService: UserSynchronizedPracticeService
    ) {}

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Get("/:historyId")
    async getHistory(@UserId() user_id: string, @Param("historyId") historyId: string){
        return await this.userSynchronizedPracticeService.getUserSynchronizedPractice(user_id, historyId)
    }

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Put("/:historyId")
    async updateHistory(@Body() updateHistoryDto: UpdateHistoryDto, @UserId() user_id: string, @Param("historyId") historyId: string){
        return await this.userSynchronizedPracticeService.updateUserSynchronizedPractice(updateHistoryDto, user_id, historyId)
    }
}