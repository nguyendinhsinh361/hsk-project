import { Body, Controller, Get, HttpStatus, Post, Query, UseInterceptors } from "@nestjs/common"
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger"
import { ScoringService } from "./scoring.service"
import { ScoringHSK4_430002InputDto, ScoringHSK5_530002InputDto, ScoringHSK5_530003InputDto, ScoringHSK6_630001InputDto } from "./dtos/scoring-input.dto"
import { AnswerEvaluationOutputDto, HSKNotConditionCommentOutputDto } from "./dtos/scoring-output.dto"
import { KindTestEnum } from "./enums/kind.enum"
import { UserId } from "../../../decorators/get-current-user-id.decorator"
import { I18NEnum } from "./enums/key.enum"
import { TimeoutInterceptor } from "../../../middleware/timeout.interceptor"
import { AITypeDto } from "./dtos/ai-type.dto"
import { AITypeEnum } from "./enums/ai-type.enum"


@ApiTags('Scoring')
@Controller("scoring")
@UseInterceptors(TimeoutInterceptor)
export class ScoringController {
    constructor(
        private readonly scoringService: ScoringService
    ) {}

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công với 1 kết quả mới được trả về ở cùng API'})
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Lượt chấm bị lỗi. Vui lòng gửi lại'})
    @ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Cần mua gói MIA để có lượt chấm' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Thời gian gửi yêu cầu chấm vượt quá 1 phút'})
    @ApiOperation({summary: 'Chấm điểm thi HSK4 - 430002'})
    @ApiQuery({ name: 'aiType', description: 'Dạng mà người dùng AI chấm: Default = 1 => Luyện tập, 2 => Thi thử', required: false, example: AITypeEnum.PRACTICE})
    @Post('hsk4/430002')
    async scoringHSK4_430002(@Query() aiTypeDto: AITypeDto, @Body() input: ScoringHSK4_430002InputDto, @UserId() user_id: string): Promise<any> {
        if(!input?.languageCode) input.languageCode = I18NEnum.VI
        return await this.scoringService.scoringHSK4_430002(input, user_id, aiTypeDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công với 1 kết quả mới được trả về ở cùng API'})
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Lượt chấm bị lỗi. Vui lòng gửi lại'})
    @ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Cần mua gói MIA để có lượt chấm' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Thời gian gửi yêu cầu chấm vượt quá 1 phút'})
    @ApiOperation({summary: 'Chấm điểm thi HSK5 - 530002'})
    @ApiQuery({ name: 'aiType', description: 'Dạng mà người dùng AI chấm: Default = 1 => Luyện tập, 2 => Thi thử', required: false, example: AITypeEnum.PRACTICE})
    @Post('hsk5/530002')
    async scoringHSK5_530002(@Query() aiTypeDto: AITypeDto, @Body() input: ScoringHSK5_530002InputDto, @UserId() user_id: string): Promise<any> {
        if(!input?.languageCode) input.languageCode = I18NEnum.VI
        return await this.scoringService.scoringHSK5_530002(input, user_id, aiTypeDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công với 1 kết quả mới được trả về ở cùng API'})
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Lượt chấm bị lỗi. Vui lòng gửi lại'})
    @ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Cần mua gói MIA để có lượt chấm' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Thời gian gửi yêu cầu chấm vượt quá 1 phút'})
    @ApiOperation({summary: 'Chấm điểm thi HSK5 - 530003'})
    @ApiQuery({ name: 'aiType', description: 'Dạng mà người dùng AI chấm: Default = 1 => Luyện tập, 2 => Thi thử', required: false, example: AITypeEnum.PRACTICE})
    @Post('hsk5/530003')
    async scoringHSK5_530003(@Query() aiTypeDto: AITypeDto, @Body() input: ScoringHSK5_530003InputDto, @UserId() user_id: string): Promise<any> {
        if(!input?.languageCode) input.languageCode = I18NEnum.VI
        return await this.scoringService.scoringHSK5_530003(input, user_id, aiTypeDto)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công với 1 kết quả mới được trả về ở cùng API'})
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Lượt chấm bị lỗi. Vui lòng gửi lại'})
    @ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Cần mua gói MIA để có lượt chấm' })
    @ApiResponse({ status: HttpStatus.REQUEST_TIMEOUT, description: 'Thời gian gửi yêu cầu chấm vượt quá 1 phút'})
    @ApiOperation({summary: 'Chấm điểm thi HSK6 - 630001'})
    @ApiQuery({ name: 'aiType', description: 'Dạng mà người dùng AI chấm: Default = 1 => Luyện tập, 2 => Thi thử', required: false, example: AITypeEnum.PRACTICE})
    @Post('hsk6/630001')
    async scoringHSK6_630001(@Query() aiTypeDto: AITypeDto, @Body() input: ScoringHSK6_630001InputDto, @UserId() user_id: string): Promise<any> {
        if(!input?.languageCode) input.languageCode = I18NEnum.VI
        return await this.scoringService.scoringHSK6_630001(input, user_id, aiTypeDto)
    }
}