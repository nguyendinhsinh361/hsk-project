import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty()
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    @MaxLength(190)
    email: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(190)
    password: string

    @ApiProperty({ description: 'string: id của thiết bị --->bắt buộc' })
    device_id: string

    @ApiProperty({ description: 'string: tên của thiết bị --->bắt buộc' })
    device: string

    @ApiProperty({ description: 'string: android - ios --->bắt buộc' })
    platforms: string

    @ApiProperty({ description: 'string: phiên bản của hệ điều hành --->bắt buộc' })
    platforms_version: string

    @ApiProperty({ description: 'string: phiên bản app --->bắt buộc' })
    app_version: string
}
