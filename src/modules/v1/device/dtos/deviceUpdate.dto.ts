import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class DeviceDto {

    @ApiProperty({ default: 'id của thieets bị cần phải truyền lên' })
    device_id: string

    @ApiProperty({ default: 'tên của thiết bị' })
    device: string

    @ApiProperty({ default: 'android - ios' })
    platforms: string

    @ApiProperty({ default: 'phiên bải của hệ điều hành' })
    platforms_version: string

    @ApiProperty({ default: 'phiên bản app' })
    app_version: string
}
