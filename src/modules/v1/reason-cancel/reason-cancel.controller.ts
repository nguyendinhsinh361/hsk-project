import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, SerializeOptions } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation} from "@nestjs/swagger";
import { UserId } from '../../../decorators/get-current-user-id.decorator';
import { ReasonCancelService } from "./reason-cancel.service";
import { Response } from "express"
import { ReasonCancelDto } from "./dtos/reason-cancel.dto";
import * as Sentry from "@sentry/node";


@ApiTags('Reason Cancel')
@Controller()
export class ReasonCancelController {
    constructor(
        private readonly reasonCancelService: ReasonCancelService
    ) {}

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Post('reason-cancel')
    async report(@Body() input: ReasonCancelDto, @Res() res: Response){
        try {
            await this.reasonCancelService.createReasonCancel(input)
            return  res.status(201).json({ message: 'Success!' })
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}