import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AIRessultDto {
    @ApiProperty({ default: '' })
    @IsNumber()
    @IsNotEmpty()
    userId: number

    @ApiProperty({ default: '' })
    @IsNumber()
    @IsOptional()
    historyId?: number

    @ApiProperty({ default: '' })
    @IsNumber()
    @IsNotEmpty()
    questionId: number

    @ApiProperty({ default: '' })
    @IsString()
    @IsNotEmpty()
    result: string

    @ApiProperty({ default: '' })
    @IsString()
    @IsNotEmpty()
    userAnswer: string

    @ApiProperty({ default: 1 })
    @IsNumber()
    @IsNotEmpty()
    aiType: number

    @ApiProperty({ default: '' })
    @IsString()
    @IsNotEmpty()
    idsChatGPT: string
}

export class AIRessultUpdateDto {
    @ApiProperty({ default: [1,2,3,4] })
    @IsOptional()
    aiScoringIds: number[] = [1,2,3,4]

    @ApiProperty({ default: 'ID history của lần luyện tập được gửi lên' })
    @IsString()
    @IsOptional()
    historyId: string
}