import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString  } from "class-validator";

export class CreateCommentDto {
    @ApiProperty()
    @IsNotEmpty()
    questionId: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    parentId: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    language: string
}
