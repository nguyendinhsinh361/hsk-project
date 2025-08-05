import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, Res, SerializeOptions } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation} from "@nestjs/swagger";
import { AIResultService } from "./ai-result.service";
import { AIRessultUpdateDto } from "./dtos/ai-result.dto";
import { UserId } from "../../../decorators/get-current-user-id.decorator";

@ApiTags('AI Result')
@Controller("ai-result")
export class AIResultController {
    constructor(
        private readonly aIResultService: AIResultService
    ) {}

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Put()
    async updateHitoryScoring(@Body() input: AIRessultUpdateDto, @UserId() user_id: string){
        return await this.aIResultService.updateAIResult(input, user_id)
    }
}