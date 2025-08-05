import { ApiProperty } from "@nestjs/swagger";
import { IsEnum,} from 'class-validator';
import { KindQuestion } from "../enums/kindQuestion.enum";

export class KindQuestionDto {
  @ApiProperty({
    default: KindQuestion.KIND_430002,
    required: true,
    description: `Please enter type question`,
    enum: KindQuestion
  })
  @IsEnum(KindQuestion)
  kind: KindQuestion = KindQuestion.KIND_430002;
}