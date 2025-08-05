import { Body, Controller, Get, HttpStatus, Post } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IdsDto } from "../../../../common/dtos/ids.dto";
import { TheoryErrorService } from "./theory.service";
import { TheoryReportDto } from "./dtos/theory-report.dto";
import { UserId } from "../../../../decorators/get-current-user-id.decorator";

@ApiTags('Question')
@Controller("question")
export class TheoryErrorController {
    constructor(
        private readonly theoryErrorService: TheoryErrorService,
    ) {}

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiOperation({summary: 'Báo cáo câu hỏi lỗi phần lí thuyết HSK'})
    @Post('report-theory')
    async reportError(@UserId() user_id: string, @Body() theoryReportDto: TheoryReportDto) {
        return await this.theoryErrorService.reportError(user_id, theoryReportDto)
    }
}