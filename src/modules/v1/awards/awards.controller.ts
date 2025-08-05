import { Body, Controller, HttpException, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { AwardsService } from "./awards.service";
import { Response } from "express"
import { UserId, AccessTokenReq} from "../../../decorators/get-current-user-id.decorator";
import { AwardsMiADto, ListUserCustomDto, UserCustomDto } from "./dtos/awards.dto";
import { EventCustomTimeService } from "../event-custom-time/event-custom-time.service";



@Controller('awards')
@ApiTags('Awards')
export class AwardsController {
    constructor(
        private readonly awardsService: AwardsService,
        private readonly eventCustomService: EventCustomTimeService,
    ) { }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực tài khoản chưa đăng nhập' })
    @Post('/custom-mia')
    async awardTrialMiA(@Query() awardsMiADto: AwardsMiADto, @Body() listUserCustomDto: ListUserCustomDto, @UserId() user_id: string) {
        return await this.awardsService.awardTrialMiACustomByEmail(awardsMiADto, listUserCustomDto, user_id)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực tài khoản chưa đăng nhập' })
    @Post('/trial-mia')
    async awardTrialMiAMine(@Body() userCustomDto: UserCustomDto, @UserId() user_id: string) {
        return await this.awardsService.awardTrialMiAMine(userCustomDto, user_id)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Tài khoản đã được nhận 3 ngày Premium + 3 Lượt chấm AI.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lỗi trong quá trình nhận quà tặng' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực tài khoản chưa đăng nhập' })
    @Post('/get-time-trial')
    async getTimeActiveTrial() {
        return await this.eventCustomService.getTimeActiveTrial()
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực tài khoản chưa đăng nhập' })
    @Post('/award-test-online')
    async awardPrizeTestOnline() {
        return await this.awardsService.awardPrizeTestOnline()
    }
}
