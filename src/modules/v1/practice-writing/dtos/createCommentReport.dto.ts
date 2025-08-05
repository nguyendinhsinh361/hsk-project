import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsString  } from "class-validator";

export class CreateCommentReportDto {
    @ApiProperty()
    @IsNotEmpty()
    commentId: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string
}
