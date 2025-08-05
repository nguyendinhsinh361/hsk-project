import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNumber, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, IsOptional } from "class-validator";

export class RegiterDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(190)
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(190)
    password: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(190)
    name: string;
    
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    day_of_birth: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    month_of_birth: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    year_of_birth: number;

    @ApiProperty()
    @IsString()
    @MaxLength(190)
    phone: string;

    @ApiProperty({ description: 'string: id của thieets bị cần phải truyền lên --->bắt buộc' })
    device_id: string

    @ApiProperty({ description: 'string: tên của thiết bị --->bắt buộc' })
    device: string

    @ApiProperty({ description: 'string: android - ios --->bắt buộc' })
    platforms: string

    @ApiProperty({ description: 'string: phiên bải của hệ điều hành --->bắt buộc' })
    platforms_version: string

    @ApiProperty({ description: 'string: phiên bản app --->bắt buộc' })
    app_version: string

}

export class RegiterBackupDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(190)
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(190)
    password: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(190)
    name: string;
    
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    day_of_birth: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    month_of_birth: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    year_of_birth: number;

    @ApiProperty()
    @IsString()
    @MaxLength(190)
    phone: string;

    @ApiProperty({ description: 'string: id của thieets bị cần phải truyền lên --->bắt buộc' })
    device_id: string

    @ApiProperty({ description: 'string: tên của thiết bị --->bắt buộc' })
    device: string

    @ApiProperty({ description: 'string: android - ios --->bắt buộc' })
    platforms: string

    @ApiProperty({ description: 'string: phiên bải của hệ điều hành --->bắt buộc' })
    platforms_version: string

    @ApiProperty({ description: 'string: phiên bản app --->bắt buộc' })
    app_version: string
}
