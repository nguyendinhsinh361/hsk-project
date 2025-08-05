import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class Affiliate {
    @ApiProperty({ description: 'Nhập mã code' })
    @IsOptional()
    code: string

    @ApiProperty({ description: 'Nhập package_key' })
    @IsOptional()
    package_key: string

    @ApiProperty({ description: "Nhập discount", default: 10 })
    @IsOptional()
    discount: number = 10
}

export class AffiliateOrder {
    @ApiProperty({ default: 'migii-hsk-affiliate' })
    @IsNotEmpty()
    key_project: string

    @ApiProperty({ default: 1570966746000 })
    @IsNotEmpty()
    @IsNumber()
    start_time: number

    @ApiProperty({ default: 1770966746000 })
    @IsNotEmpty()
    @IsNumber()
    end_time: number
}

export class VerifyGoogle {
    @ApiProperty()
    subscriptionId: string

    @ApiProperty()
    token: string

    @ApiProperty({ description: 'string: id của thiết bị cần phải truyền lên --->bắt buộc' })
    device_id: string

    @ApiProperty({ description: 'string: tên của thiết bị --->bắt buộc' })
    device: string

    @ApiProperty({ description: 'string: phiên bải của hệ điều hành --->bắt buộc' })
    platforms_version: string

    @ApiProperty({ description: 'string: phiên bản app --->bắt buộc' })
    app_version: string

    @ApiProperty({ description: 'Nhập các thông tin về affiliate', required: false })
    @IsOptional()
    affiliate?: Affiliate
}

export class VerifyIos {
    @ApiProperty()
    receipt: string

    @ApiProperty({ default: 'sandbox'})
    @IsOptional()
    type: string

    @ApiProperty({ description: 'string: id của thiết bị cần phải truyền lên --->bắt buộc' })
    device_id: string

    @ApiProperty({ description: 'string: tên của thiết bị --->bắt buộc' })
    device: string

    @ApiProperty({ description: 'string: phiên bải của hệ điều hành --->bắt buộc' })
    platforms_version: string

    @ApiProperty({ description: 'string: phiên bản app --->bắt buộc' })
    app_version: string

    @ApiProperty({ description: 'Nhập các thông tin về affiliate', required: false })
    @IsOptional()
    affiliate?: Affiliate
}

export class AddPurchase {
    @ApiProperty()
    user_id: string

    @ApiProperty()
    transaction_id: string

    @ApiProperty()
    product_id: string

    @ApiProperty()
    platforms: string

    @ApiProperty()
    product_id_sale: string
   
    @ApiProperty()
    appStoreReceipt: string

    @ApiProperty()
    purchase_date: string

    @ApiProperty()
    time_expired: string


    @ApiProperty({ description: 'string: id của thiết bị cần phải truyền lên --->bắt buộc' })
    device_id: string

    @ApiProperty({ description: 'string: tên của thiết bị --->bắt buộc' })
    device: string

    @ApiProperty({ description: 'string: phiên bải của hệ điều hành --->bắt buộc' })
    platforms_version: string

    @ApiProperty({ description: 'string: phiên bản app --->bắt buộc' })
    app_version: string

    @ApiProperty({ description: 'Nhập các thông tin về affiliate', required: false })
    @IsOptional()
    affiliate?: Affiliate
}

export class AddPurchaseLog {
    @ApiProperty()
    user_id: string

    @ApiProperty()
    transaction_id: string

    @ApiProperty()
    product_id: string

    @ApiProperty()
    platforms: string

    @ApiProperty()
    product_id_sale: string
   
    @ApiProperty()
    appStoreReceipt: string

    @ApiProperty()
    purchase_date: string

    @ApiProperty()
    time_expired: string


    @ApiProperty({ description: 'string: id của thiết bị cần phải truyền lên --->bắt buộc' })
    device_id: string

    @ApiProperty({ description: 'string: tên của thiết bị --->bắt buộc' })
    device: string

    @ApiProperty({ description: 'string: phiên bải của hệ điều hành --->bắt buộc' })
    platforms_version: string

    @ApiProperty({ description: 'string: phiên bản app --->bắt buộc' })
    app_version: string

    @ApiProperty({ description: 'Nhập các thông tin về affiliate', required: false })
    @IsOptional()
    affiliate?: Affiliate
}