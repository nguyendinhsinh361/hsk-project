import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LanguageEventEnum } from '../enums/event.enum';
import { PaginateDto } from 'src/common/dtos/paginate.dto';
import { Type } from 'class-transformer';
import { TickEnum } from '../../theory-notebook/enums/theoryNotebook.enum';

export class UserCustomDto {
  @ApiProperty({})
  info: string;
}

export class ListUserCustomDto {
  @ApiProperty({})
  emails: string[];
}

export class EventRequestDto {
  @ApiProperty({
    default: LanguageEventEnum.VI,
    required: false,
    description: `Please enter language`,
    enum: LanguageEventEnum,
  })
  @IsEnum(LanguageEventEnum)
  @IsOptional()
  language: LanguageEventEnum = LanguageEventEnum.VI;
}

export class EventDetailDto {
  @ApiProperty({
    default: LanguageEventEnum.VI,
    required: false,
    description: `Please enter language`,
    enum: LanguageEventEnum,
  })
  @IsEnum(LanguageEventEnum)
  @IsOptional()
  language: LanguageEventEnum = LanguageEventEnum.VI;

  @ApiProperty({})
  event_id: string;
}

export class ExamEventDetailDto {
  @ApiProperty({})
  exam_event_id: string;
}

export class RankingFilterDto extends OmitType(PaginateDto, ['search']) {
  @ApiProperty({
    required: true,
    description: `Please enter event_id`,
  })
  @IsNotEmpty()
  @IsString()
  event_id: string;
}

export class AnswerDetailDto {
  @ApiProperty({})
  @IsNotEmpty()
  id: number;

  @ApiProperty({})
  @IsArray()
  @IsNotEmpty()
  answer: string[];

  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  correct: number[];
}

export class UpdateResultExamOnlineDto {
  @ApiProperty({
    required: true,
    description: `Please enter test_id`,
  })
  @IsNotEmpty()
  @IsNumber()
  test_id: number;

  @ApiProperty({
    required: true,
    description: `Please enter event_id`,
  })
  @IsNotEmpty()
  @IsNumber()
  event_id: number;

  @ApiProperty({
    description: 'Mảng dữ liệu kết quả của toàn bộ bài thi của người học',
    type: [AnswerDetailDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDetailDto)
  answers: AnswerDetailDto[];

  @ApiProperty({
    required: true,
    description: `Please enter work_time`,
  })
  @IsNotEmpty()
  @IsNumber()
  work_time: number;
}

export class UserFollowDto {
  @ApiProperty({
    required: true,
    description: `Please enter event_id`,
  })
  @IsNotEmpty()
  @IsString()
  event_id: string;

  @ApiProperty({
    description: 'Please enter follow option',
    required: true,
    enum: TickEnum,
  })
  @IsEnum(TickEnum)
  @IsNotEmpty()
  follow?: TickEnum;
}
