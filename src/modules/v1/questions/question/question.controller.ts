import { Body, Controller, Get, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { IdsDto } from "../../../../common/dtos/ids.dto";
import { QuestionService } from "./question.service";
import { FixContentPDFDto, QuestionPracticeDto } from "./dtos/question-practice.dto";
import { UserId } from "../../../../decorators/get-current-user-id.decorator";


@ApiTags('Question')
@Controller("question")
export class QuestionController {
    constructor(
        private readonly questionService: QuestionService,
    ) { }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({ summary: 'Kiểm tra câu hỏi có tồn tại hay không' })
    @Post('check-exist')
    async checkExistQuestion(@Body() idsDto: IdsDto) {
        return await this.questionService.checkExistQuestion(idsDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Vui lòng nâng cấp lên Premium' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server bị lỗi' })
    @ApiResponse({ status: HttpStatus.GATEWAY_TIMEOUT, description: 'Server bị gatewaytimeout' })
    @ApiOperation({ summary: 'Lấy câu hỏi luyện tập' })
    @Get('get-question-practice')
    async getQuestionPractice(@UserId() user_id: string, @Query() questionPracticeDto: QuestionPracticeDto) {
        return await this.questionService.getQuestionPractice(user_id, questionPracticeDto)
    }

}