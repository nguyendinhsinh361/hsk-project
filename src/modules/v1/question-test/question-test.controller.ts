import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { QuestionTestService } from "./question-test.service";
import { UserId } from "../../../decorators/get-current-user-id.decorator";
import { GetQuestionTestCustomByTypeDto, InputGetQuestionTestCustomDto, InputGetQuestionTestCustomLanguageDto } from "./dtos/question-test.dto";


@ApiTags('Question Test')
@Controller("question-test")
export class QuestionTestController {
    constructor(
        private readonly questionTestService: QuestionTestService,
    ) { }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
    @ApiOperation({ summary: 'Lấy đề thi theo type' })
    @Get('/:questionTestId')
    async getQuestionCustom(@UserId() user_id: string, @Param("questionTestId") questionTestId: string, @Query() inputGetQuestionTestCustomDto: InputGetQuestionTestCustomDto) {
        return await this.questionTestService.getQuestionTestCustom(user_id, questionTestId, inputGetQuestionTestCustomDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
    @ApiOperation({ summary: 'Lấy đề thi theo type V2' })
    @Get('/exam-detail/:examId')
    async getExamCustom(@UserId() user_id: string, @Param("examId") examId: string, @Query() inputGetQuestionTestCustomLanguageDto: InputGetQuestionTestCustomLanguageDto) {
        return await this.questionTestService.getExamV2Custom(user_id, examId, inputGetQuestionTestCustomLanguageDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({ summary: 'Lấy danh sách ids bài thi' })
    @Get('/listExamIds/:level')
    async getQuestionTestId(@UserId() userId: string, @Param("level", ParseIntPipe) level: number, @Query() inputGetQuestionTestCustomLanguageDto: InputGetQuestionTestCustomLanguageDto) {
        return await this.questionTestService.getIdQuestionTest(userId, level, inputGetQuestionTestCustomLanguageDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({ summary: 'Lấy danh sách ids bài thi' })
    @Post('/list-ids/')
    async getListExamIdsByType(@UserId() userId: string, @Query() getQuestionTestCustomByTypeDto: GetQuestionTestCustomByTypeDto) {
        return await this.questionTestService.getListExamIdsByType(userId, getQuestionTestCustomByTypeDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({ summary: 'Cập nhật lại title' })
    @Put('/update-title/')
    async updateTitle(@Query() getQuestionTestCustomByTypeDto: GetQuestionTestCustomByTypeDto) {
        return await this.questionTestService.updateTitle(getQuestionTestCustomByTypeDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({ summary: 'Cập nhật lại payment_type' })
    @Put('/update-premium-type/')
    async updatePremiumTypeQuestionTest() {
        return await this.questionTestService.updatePremiumTypeQuestionTest()
    }
}