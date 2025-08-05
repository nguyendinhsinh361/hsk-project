import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { KindPracticeQuestionEnum, KindQuestion, LevelHSKEnum } from "../../../../../modules/v1/practice-writing/enums/kindQuestion.enum";
import { PlatformsEnum } from "../../../../../modules/v1/practice-writing/enums/platfroms.enum";

export class QuestionPracticeDto {
    @ApiProperty({ default: 'Device ID: ID của thiết bị' })
    @IsString()
    @IsOptional()
    device_id?: string = null

    @ApiProperty({ default: PlatformsEnum.IOS, enum: PlatformsEnum })
    @IsEnum(PlatformsEnum)
    @IsOptional()
    platforms?: string = PlatformsEnum.IOS

    @ApiProperty({
        default: KindPracticeQuestionEnum.KIND_110001,
        required: true,
        description: `Please enter type question`,
        enum: KindPracticeQuestionEnum
    })
    @IsEnum(KindPracticeQuestionEnum)
    kind: KindPracticeQuestionEnum = KindPracticeQuestionEnum.KIND_110001;

    @ApiProperty({ description: 'Nhập ngôn ngữ' })
    @IsString()
    @IsOptional()
    lang?: string = null

    @ApiProperty({
        default: LevelHSKEnum.HSK1,
        description: 'Nhập level của câu hỏi',
        required: true,
        enum: LevelHSKEnum
    })
    @IsOptional()
    @IsEnum(LevelHSKEnum)
    level?: LevelHSKEnum = LevelHSKEnum.HSK1

    @ApiProperty({ description: 'Nhập số lượng muốn lấy: Tối đa 50 câu hỏi' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    limit?: number = null
}

export class FixContentPDFDto {
    @ApiProperty({ default: 'id' })
    @IsString()
    key: string

    @ApiProperty({ default: 'id' })
    @IsNumber()
    id: number

    @ApiProperty({ default: 'textReplace' })
    @IsString()
    textReplace: string
}