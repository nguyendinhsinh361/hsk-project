import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginAppleDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    access_token: string

    @ApiProperty({ description: 'string: tên của người dùng (Nếu client không lấy được tên thì chuyền lên string rỗng)--->bắt buộc' })
    name: string

    @ApiProperty({ description: 'string: id của thiết bị cần phải truyền lên --->bắt buộc' })
    device_id: string

    @ApiProperty({ description: 'string: tên của thiết bị --->bắt buộc' })
    device: string

    @ApiProperty({ description: 'string: phiên bải của hệ điều hành --->bắt buộc' })
    platforms_version: string

    @ApiProperty({ description: 'string: phiên bản app --->bắt buộc' })
    app_version: string
}
