import {
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { KindPracticeQuestionEnum } from 'src/modules/v1/practice-writing/enums/kindQuestion.enum';
import { RouteLevelEnum } from '../../routes-default/enums/route-level.enum';

class QuestionDto {
  @ApiProperty({
    description: 'Nhập số lượng câu con đúng',
    type: Number,
    required: true,
    default: 1
  })
  @IsNumber()
  true: number =1;

  @ApiProperty({
    description: 'Nhập số lượng câu con sai',
    type: Number,
    required: true,
    default: 0
  })
  @IsNumber()
  false: number = 0;

  @ApiProperty({
    description: 'Nhập ID của câu hỏi',
    type: Number,
    required: true,
    default: 33340
  })
  @IsNumber()
  id: number = 33340;
}

class KindDetailDto {
  @ApiProperty({
    description: 'Nhập kind',
    enum: KindPracticeQuestionEnum,
    required: true,
  })
  @IsEnum(KindPracticeQuestionEnum)
  kind: KindPracticeQuestionEnum = KindPracticeQuestionEnum.KIND_110001;

  @ApiProperty({
    type: [QuestionDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

export class DetailFinalDto {
  @ApiProperty({
    type: [KindDetailDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KindDetailDto)
  detail: KindDetailDto[];

  @ApiProperty({
    type: Number,
    required: true,
    default: 1645278778517
  })
  @IsNumber()
  timeStart: number = 1645278778517;

  @ApiProperty({
    type: Number,
    required: true,
    default: 1645278590115
  })
  @IsNumber()
  timeEnd: number = 1645278590115;
}

export class ResultEvaluateLevelDto {
  @ApiProperty({
    description: 'Nhập kind',
    enum: RouteLevelEnum,
    required: true,
  })
  @IsEnum(RouteLevelEnum)
  level: RouteLevelEnum = RouteLevelEnum.LEVEL_1030;

  @ApiProperty({
    type: DetailFinalDto,
    required: true,
  })
  @ValidateNested({ each: true })
  @Type(() => DetailFinalDto)
  detail: DetailFinalDto;
}
