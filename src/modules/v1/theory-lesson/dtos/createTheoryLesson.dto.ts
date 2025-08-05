import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PaginateDto } from '../../../../common/dtos/paginate.dto';
import { Type } from 'class-transformer';
import { KindFilterEnum, TheoryLevelEnum } from '../../theory-notebook/enums/theoryNotebook.enum';
import { TheoryLessonComplete } from '../enums/theoryLesson.enum';
import { EventRequestDto } from '../../event/dtos/event.dto';

export class CreateTheoryLessonDto {
  @ApiProperty({ description: 'ID của từ/câu lí thuyết', default: "0" })
  @IsString()
  lessonId: string = "0";

  @ApiProperty({ description: 'Level của bài học', required: false, enum: TheoryLevelEnum })
  @IsEnum(TheoryLevelEnum)
  @IsOptional()
  level?: TheoryLevelEnum;

  @ApiProperty({ description: 'Trạng thái của bài học: 1 - Hoàn thành, 0 - Chưa hoàn thành', required: false, enum: TheoryLessonComplete })
  @IsEnum(TheoryLessonComplete)
  @IsOptional()
  completedStatus?: TheoryLessonComplete;

  @ApiProperty({
    default: KindFilterEnum.HANZII,
    required: false,
    description: `Chọn kind của lí thuyết: word, grammar, hanzii`,
    enum: KindFilterEnum
  })
  @IsEnum(KindFilterEnum)
  @IsOptional()
  kind: KindFilterEnum = KindFilterEnum.HANZII;
}

export class CreateTheoryLessonArrayDto {
  @ApiProperty({
    description: 'Mảng các đối tượng CreateTheoryLessonDto',
    type: [CreateTheoryLessonDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTheoryLessonDto)
  theoryInput: CreateTheoryLessonDto[];
}

export class PaginateTheoryLessonFilterDto extends OmitType(PaginateDto, ['search']) {
  @ApiProperty({ description: 'Level của từ/câu lí thuyết', required: true, default: TheoryLevelEnum.LEVEL_1, enum: TheoryLevelEnum })
  @IsNotEmpty()
  @IsEnum(TheoryLevelEnum)
  level: TheoryLevelEnum;

  @ApiProperty({
    default: KindFilterEnum.HANZII,
    required: false,
    description: `Chọn kind của lí thuyết: word, grammar, hanzii`,
    enum: KindFilterEnum
  })
  @IsEnum(KindFilterEnum)
  @IsOptional()
  kind: KindFilterEnum = KindFilterEnum.HANZII;
}


export class TheoryVersiontDto extends EventRequestDto {}