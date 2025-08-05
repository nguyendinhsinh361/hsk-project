import { ApiProperty, OmitType, PickType } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { LanguageTitleEnum, QuestionTestKindEnum, QuestionTestVersionEnum } from "../enum/question-test.enum";
import { LevelHSKEnum } from "../../practice-writing/enums/kindQuestion.enum";

export class InputGetQuestionTestCustomDto {
    @ApiProperty({ description: 'Không truyền type thì lấy all. 0: Listening, 1: Reading, 2: Writting', required: false })
    @IsOptional()
    type: number

    @ApiProperty({ description: 'Ngôn ngữ', required: false, default: LanguageTitleEnum.VI, enum: LanguageTitleEnum })
    @IsOptional()
    @IsEnum(LanguageTitleEnum)
    language: LanguageTitleEnum = LanguageTitleEnum.EN

    @ApiProperty({ description: 'Version - Từ version 2 trở đi sẽ dùng title_lang, version 1 sẽ dùng title', required: false, default: QuestionTestVersionEnum.V1, enum: QuestionTestVersionEnum })
    @IsOptional()
    @IsEnum(QuestionTestVersionEnum)
    version: QuestionTestVersionEnum = QuestionTestVersionEnum.V1
}

export class InputGetQuestionTestCustomLanguageDto extends OmitType(InputGetQuestionTestCustomDto, ['type']) {}

export class InputGetQuestionTestCustomV2Dto {
    @ApiProperty({ description: 'Full Test - 1, Skill Test - 2', enum: QuestionTestKindEnum, default: QuestionTestKindEnum.FULL_TEST ,required: true })
    @IsNotEmpty()
    @IsEnum(QuestionTestKindEnum)
    type: QuestionTestKindEnum = QuestionTestKindEnum.FULL_TEST
}

export class GetQuestionTestCustomByTypeDto extends PickType(InputGetQuestionTestCustomDto, ['language', 'version']) {
    @ApiProperty({ description: 'Nhập type đề thi bạn muốn lấy: \n\n- Full test: 1\n\n- Skill test: 2\n\n- Advance test: 3', required: true, enum: QuestionTestKindEnum, default: QuestionTestKindEnum.FULL_TEST })
    @IsNotEmpty()
    @IsEnum(QuestionTestKindEnum)
    type: QuestionTestKindEnum = QuestionTestKindEnum.FULL_TEST

    @ApiProperty({
        default: LevelHSKEnum.HSK1,
        description: 'Nhập level của đề thi',
        required: true,
        enum: LevelHSKEnum
    })
    @IsOptional()
    @IsEnum(LevelHSKEnum)
    level?: LevelHSKEnum = LevelHSKEnum.HSK1
}