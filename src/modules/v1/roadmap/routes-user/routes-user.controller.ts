import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, Res, SerializeOptions } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation} from "@nestjs/swagger";
import { UserId } from '../../../../decorators/get-current-user-id.decorator';
import { RoutesUserService } from "./routes-user.service";
import { RoutesUserDetailDto, RoutesUserDto, RoutesUserResettDto, RoutesUserUpdateDto } from "./dtos/routes-user.dto";
import * as Sentry from "@sentry/node";
import { QuestionsEvaluateLevelService } from "../question-evaluate-level/question-evaluate-level.service";
import { ResultEvaluateLevelDto } from "../question-evaluate-level/dtos/result-evaluate-level.dto";


@ApiTags('Roadmap')
@Controller("roadmap")
export class RoutesUserController {
    constructor(
        private readonly routesUserService: RoutesUserService,
        private readonly questionsEvaluateLevelService: QuestionsEvaluateLevelService,
    ) {}

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không có dữ liệu lộ trình' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Lộ trình đã tồn tại' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Tạo một lộ trình hóa cá nhân mới cho người dùng'})
    @Post('create')
    async createRoadmap(@UserId() user_id: string, @Query() input: RoutesUserDto){
        try {
            await this.routesUserService.createNewRoutesUser(user_id, input)
            return { message: 'Success!' }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không có dữ liệu lộ trình' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Lấy chi tiết lộ trình mà người dùng đang học'})
    @Get('detail')
    async getDetailRoadmap(@UserId() user_id: string, @Query() input: RoutesUserDetailDto){
        try {
            const routeDetail = await this.routesUserService.getDetailNewestRouteLevelFromUser(user_id, input)
            return { 
                data: routeDetail,
                message: 'Success!'
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không có dữ liệu lộ trình' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Tiến hành cập nhật lộ trình mới khi gửi kết quả luyện tập'})
    @Put('update')
    async updateRoadmap(@UserId() user_id: string, @Body() input: RoutesUserUpdateDto){
        try {
            const data = await this.routesUserService.updateResultPracticeForRouteUser(user_id, input)
            return { 
                data: data,
                message: 'Success!'
            }
        } catch (error) {
            console.log(error)
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Xây dựng lại lộ trình cho người học(Yêu cầu làm lại một bài đánh giá)'})
    @Put('reset')
    async resetRoadmap(@UserId() user_id: string, @Query() input: RoutesUserResettDto){
        try {
            const data = await this.routesUserService.resetRouteFromIndexRoute(user_id, input)
            return { 
                data: data,
                message: 'Success!'
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Xây dựng lại lộ trình cho người học(Yêu cầu làm lại một bài đánh giá)'})
    @Delete('delete/:id')
    async deleteRoadmap(@UserId() user_id: string, @Param("id") id: string){
        try {
            await this.routesUserService.deleteRouteUser(user_id, id)
            return { 
                data: null,
                message: 'Success!'
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Lấy bài đánh giá đầu vào cho người học'})
    @Post('evaluate-exam')
    async getEvaluateExam(@UserId() user_id: string, @Query() input: RoutesUserDetailDto){
        try {
            const evaluateExamDetail = await this.questionsEvaluateLevelService.getExamEvaluate(user_id, input)
            return { 
                data: evaluateExamDetail,
                message: 'Success!'
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: 'Gửi lên kết quả đánh giá bài đánh giá đầu vào cho người học'})
    @Post('result-evaluate-exam')
    async getResultEvaluateExam(@UserId() user_id: string, @Body() input: ResultEvaluateLevelDto){
        try {
            await this.questionsEvaluateLevelService.createResultEvaluateExamForUser(user_id, input)
            return { 
                data: null,
                message: 'Success!'
            }
        } catch (error) {
            console.log(error)
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}