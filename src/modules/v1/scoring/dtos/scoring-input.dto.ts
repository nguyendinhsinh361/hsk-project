import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString  } from "class-validator";
import { ChatGPTHSK4_430002ExampleEnum, ChatGPTHSK5_530002ExampleEnum, ChatGPTHSK5_530003ExampleEnum, ChatGPTHSK6_630001ExampleEnum } from "../../chatgpt/enums/chatGPT.enum";
import { I18NEnum } from "../enums/key.enum";

export class ScoringHSK4_430002InputDto {
    @ApiProperty({default: I18NEnum.EN})
    @IsString()
    @IsOptional()
    languageCode?: I18NEnum

    @ApiProperty({default: "40928"})
    @IsString()
    @IsNotEmpty()
    questionId: string = "40928"

    @ApiProperty({
        default: ChatGPTHSK4_430002ExampleEnum.IMG_URL,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    imgUrl: string

    @ApiProperty({
        default: ChatGPTHSK4_430002ExampleEnum.REQUIRED_WORD,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    requiredWord: string

    @ApiProperty({
        default: ChatGPTHSK4_430002ExampleEnum.ANSWER,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    answer: string
}

export class ScoringHSK5_530002InputDto {
    @ApiProperty({default: I18NEnum.EN})
    @IsString()
    @IsOptional()
    languageCode?: I18NEnum

    @ApiProperty({default: "41542"})
    @IsString()
    @IsNotEmpty()
    questionId: string = "41542"

    @ApiProperty({
        default: ChatGPTHSK5_530002ExampleEnum.REQUIRED_WORD,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    requiredWord: string

    @ApiProperty({
        default: ChatGPTHSK5_530002ExampleEnum.ANSWER,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    answer: string
}

export class ScoringHSK5_530003InputDto  {
    @ApiProperty({default: I18NEnum.EN})
    @IsString()
    @IsOptional()
    languageCode?: I18NEnum

    @ApiProperty({default: "41557"})
    @IsString()
    @IsNotEmpty()
    questionId: string = "41557"

    @ApiProperty({
        default: ChatGPTHSK5_530003ExampleEnum.IMG_URL,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    imgUrl: string

    @ApiProperty({
        default: ChatGPTHSK5_530003ExampleEnum.ANSWER,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    answer: string
}

export class ScoringHSK6_630001InputDto {
    @ApiProperty({default: I18NEnum.EN})
    @IsString()
    @IsOptional()
    languageCode?: I18NEnum
    
    @ApiProperty({default: "44836"})
    @IsString()
    @IsNotEmpty()
    questionId: string = "44836"

    @ApiProperty({default: "Nhập tiêu đề cho bài tóm tắt"})
    @IsString()
    @IsOptional()
    title?: string

    @ApiProperty({
        default: ChatGPTHSK6_630001ExampleEnum.REQUIRED_PARAGRAPH,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    requiredParagraph: string

    @ApiProperty({
        default: ChatGPTHSK6_630001ExampleEnum.ANSWER,
        required: true
    })
    @IsString()
    @IsNotEmpty()
    answer: string
}
