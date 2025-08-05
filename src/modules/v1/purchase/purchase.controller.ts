import { Body, Controller, HttpException, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { PurchaseService } from "./purchase.service";
import { AddPurchase, AffiliateOrder, VerifyGoogle, VerifyIos } from "./dtos/purchase.dto"
import { Response } from "express"
import { UserId, AccessTokenReq} from "../../../decorators/get-current-user-id.decorator";
import { GetBankingActiveKey } from "../../../decorators/get-banking-active-key.decorator";
import { BankingActiceDataDto, CreateVirtualBillDto } from "./dtos/banking-active.dto";



@Controller()
@ApiTags('Purchase')
export class PurchaseController {
    constructor(
        private readonly purchaseService: PurchaseService
    ) { }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Đã được đồng bộ trước đó rồi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực tài khoản chưa đăng nhập' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Lỗi xác thực gói mua' })
    @Post('purchase/verifiedGoogleStore')
    async verifiedGoogleStore(@UserId() user_id: string, @AccessTokenReq() access_token: string, @Body() verifyGoogle: VerifyGoogle, @Res() res: Response) {
        return await this.purchaseService.verifiedGoogleStore(user_id, access_token, verifyGoogle, res)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Đã được đồng bộ trước đó rồi' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Lỗi xác thực' })
    @Post('purchase/verifiedAppleStore')
    async verifiedAppleStore(@UserId() user_id: string, @AccessTokenReq() access_token: string, @Body() verifyIos: VerifyIos, @Res() res: Response) {
        return await this.purchaseService.verifiedAppleStore(user_id, access_token, verifyIos, res)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Sai kiểu dữ liệu' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Không có quyền lấy dữ liệu' })
    @Post('purchase/affiliateOrder')
    async affiliateOrder(@Body() body: AffiliateOrder) {
        if (body.key_project == 'migii-hsk-affiliate'){
            const result = await this.purchaseService.getAffiliateOrder(body)
            return {"orders":result}
        }else{
            throw new HttpException('Không có quyền lấy dữ liệu', HttpStatus.FORBIDDEN)
        }
    }

    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 500, description: 'Lỗi server' })
    @ApiResponse({ status: 401, description: 'Vui lòng đăng nhập' })
    @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
    @Post('purchase/bankingActive')
    async premiumActiveBanking(@GetBankingActiveKey() banking_key_active: string, @Body() bankingActiceDataDto: BankingActiceDataDto) {
        const result = await this.purchaseService.bankingActivePremium(bankingActiceDataDto)
        return result
    } 

    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 500, description: 'Lỗi server' })
    @ApiResponse({ status: 401, description: 'Vui lòng đăng nhập' })
    @ApiResponse({ status: 400, description: 'Lỗi khi lấy đơn ảo' })
    @Post('purchase/virtualBill')
    async getVirtualBillHSK(@UserId() user_id: string, @Body() createVirtualBillDto: CreateVirtualBillDto) {
        const result = await this.purchaseService.getVirtualBillHSK(user_id, createVirtualBillDto)
        return result
    } 
}
