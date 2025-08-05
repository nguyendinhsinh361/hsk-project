import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString  } from "class-validator";
import { AITypeEnum } from "../enums/ai-type.enum";

export class AITypeDto {
    @ApiProperty({default: AITypeEnum.PRACTICE})
    @IsNotEmpty()
    aiType: AITypeEnum = AITypeEnum.PRACTICE
}