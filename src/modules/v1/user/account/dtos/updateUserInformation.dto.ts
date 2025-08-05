import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateUserInformationDto {
    @ApiProperty({ default: 'Tên người dùng' })
    @IsOptional()
    @IsString()
    name: string

    @ApiProperty({ default: 22 })
    @IsOptional()
    @Min(1)
    @Max(31)
    @IsNumber()
    day_of_birth: number

    @ApiProperty({ default: 11 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(12)
    month_of_birth: number

    @ApiProperty({ default: 2024 })
    @IsOptional()
    @IsNumber()
    year_of_birth: number

    @ApiProperty({ default: "boy: 1, girl: 0" })
    @IsOptional()
    @IsNumber()
    sex: number

    @ApiProperty({ default: '0987654321' })
    @IsOptional()
    @IsString()
    phone: string

    @ApiProperty({ default: 'vn' })
    @IsOptional()
    @IsString()
    country: string
}
