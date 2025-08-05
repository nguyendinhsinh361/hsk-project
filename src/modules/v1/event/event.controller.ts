import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EventService } from "./event.service";
import { UserId } from "../../../decorators/get-current-user-id.decorator";
import { EventDetailDto, EventRequestDto, ExamEventDetailDto, RankingFilterDto, UpdateResultExamOnlineDto, UserFollowDto } from "./dtos/event.dto";
import { PaginateDto } from "src/common/dtos/paginate.dto";

@Controller('event')
@ApiTags('Event')
export class EventController {
    constructor(
        private readonly eventService: EventService,
    ) {}
    
    @Post('')
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    async getEventNewest() {
        return await this.eventService.getEventNewest()
    }

    @Get('latest-time')
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    async getLatestTime() {
        return await this.eventService.getLatestTime()
    }

    @Get('event-list')
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: '/Events/eventList - Lấy ra tất cả sự kiện đang có', description: "Chuyển API Loopback sang NestJS"})
    async getListEvent(@UserId() user_id: string, @Query() eventRequestDto: EventRequestDto) {
        return await this.eventService.getListEvent(user_id, eventRequestDto)
    }

    @Get('event-detail')
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: '/Events/testOnline - Lấy ra chi tiết một sự kiện thi thử', description: "Chuyển API Loopback sang NestJS"})
    async getEventDetail(@UserId() user_id: string, @Query() eventDetailDto: EventDetailDto) {
        return await this.eventService.getEventDetail(user_id, eventDetailDto)
    }

    @Get('exam-event-detail')
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: '/Events/testOnlineDetail - Lấy ra chi tiết một đề thi của sự kiện thi thử', description: "Chuyển API Loopback sang NestJS"})
    async getExamForEventDetail(@Query() examEventDetailDto: ExamEventDetailDto) {
        return await this.eventService.getExamForEventDetail(examEventDetailDto)
    }

    @Get('event-history')
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: '/Events/testOnlineHistory - Lấy ra chi tiết một lịch sử sự kiện thi thử', description: "Chuyển API Loopback sang NestJS"})
    async getEventHistoryDetail(@UserId() user_id: string, @Query() eventDetailDto: EventDetailDto) {
        return await this.eventService.getEventHistoryDetail(user_id, eventDetailDto)
    }

    @Get('ranking')
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: '/Events/testOnlineRank - Lấy ra rank của user trong sự kiện thi thử', description: "Chuyển API Loopback sang NestJS"})
    async getEventRankForUser(@UserId() user_id: string, @Query() rankingFilterDto: RankingFilterDto) {
        return await this.eventService.getEventRankForUser(user_id, rankingFilterDto)
    }

    @Post('complete-exam')
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: '/Events/testOnlineResult - Cập nhập bài làm cho đề thi của sự kiện thi thử của user', description: "Chuyển API Loopback sang NestJS"})
    async updateResultForEvent(@UserId() user_id: string, @Body() updateResultExamOnlineDto: UpdateResultExamOnlineDto) {
        return await this.eventService.updateResultForEvent(user_id, updateResultExamOnlineDto)
    }

    @Post('follow')
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiOperation({summary: '/Events/userFollow - Cập nhập bài làm cho đề thi của sự kiện thi thử của user', description: "Chuyển API Loopback sang NestJS"})
    async updateFollowUser(@UserId() user_id: string, @Body() userFollowDto: UserFollowDto) {
        return await this.eventService.updateFollowUser(user_id, userFollowDto)
    }
}
