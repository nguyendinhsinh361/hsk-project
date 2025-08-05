import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class TheoryReportDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    questionId: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    platform: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string

    @ApiProperty({ default: "Từ vựng: 0, Ngữ pháp: 1"})
    @IsString()
    @IsNotEmpty()
    kind: string = "Từ vựng: 0, Ngữ pháp: 1"

    @ApiProperty({ default: "Ngôn ngữ của lí thuyết"})
    @IsString()
    @IsOptional()
    language?: string = "vi"

    @ApiProperty()
    @IsString()
    @IsOptional()
    appVersion?: string
}
