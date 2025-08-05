import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString  } from "class-validator";

export class ChatGPTUsageDto {
    @ApiProperty()
    @IsNotEmpty()
    input: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    output: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    model: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    project_key: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    type: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    prompt_tokens: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    completion_tokens: number
}
