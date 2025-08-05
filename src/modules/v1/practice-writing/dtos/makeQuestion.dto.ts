import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString  } from "class-validator";

export class MakeQuestionDto {
    @ApiProperty({ description: 'Nội dung câu hỏi' })
    @IsString()
    @IsOptional()
    question?: string

    @ApiProperty({
        description: 'Ảnh liên quan tới câu hỏi',
        type: String,
        format: 'binary',
        required: false,
      })
    @IsString()
    @IsOptional()
    img?: string
}
