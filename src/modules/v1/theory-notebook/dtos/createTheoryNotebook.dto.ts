import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { KindFilterEnum, TheoryLevelEnum, TickEnum, UnderstandLevelFilterEnum } from '../enums/theoryNotebook.enum';
import { PaginateDto } from '../../../../common/dtos/paginate.dto';
import { Type } from 'class-transformer';

export class CreateTheoryNotebookDto {
  @ApiProperty({ description: 'ID của từ/câu lí thuyết', default: "0" })
  @IsString()
  theoryId: string = "0";

  @ApiProperty({ description: 'Thêm ghi chú', required: false })
  @IsString()
  @IsOptional()
  takeNote?: string;

  @ApiProperty({ description: 'Thêm đánh dấu: Có(1), Không(0)', required: false, enum: TickEnum })
  @IsEnum(TickEnum)
  @IsOptional()
  tick?: TickEnum;

  @ApiProperty({ description: 'Mức độ hiểu biết của bạn: Mặc định(0), Đã biết(1), Không biết(2), Không chắc(3)', required: false, enum: UnderstandLevelFilterEnum })
  @IsEnum(UnderstandLevelFilterEnum)
  @IsOptional()
  understandLevel: UnderstandLevelFilterEnum;

  @ApiProperty({ description: 'Level của từ/câu lí thuyết', required: false, enum: TheoryLevelEnum })
  @IsEnum(TheoryLevelEnum)
  @IsOptional()
  level?: TheoryLevelEnum;

  @ApiProperty({
    default: KindFilterEnum.HANZII,
    required: false,
    description: `Chọn kind của lí thuyết: word, grammar, hanzii`,
    enum: KindFilterEnum
  })
  @IsEnum(KindFilterEnum)
  @IsOptional()
  kind?: KindFilterEnum = KindFilterEnum.HANZII;

  @ApiProperty({ description: 'Đã click vào lí thuyết (hiện tại làm cho phần grammar): Có(1), Không(0)', required: false, enum: TickEnum, default: TickEnum.FALSE})
  @IsEnum(TickEnum)
  @IsOptional()
  click?: TickEnum = TickEnum.FALSE;

  @ApiProperty({ description: 'Nội dung lí thuyết từ', required: false })
  @IsString()
  @IsOptional()
  word?: string;

  @ApiProperty({ description: 'Nội dung lí thuyết ngữ pháp', required: false })
  @IsString()
  @IsOptional()
  grammar?: string;

  @ApiProperty({ description: 'Nội dung lí thuyết hán tự', required: false })
  @IsString()
  @IsOptional()
  hanzii?: string;
}

export class CreateTheoryNotebookArrayDto {
  @ApiProperty({
    description: 'Mảng các đối tượng CreateTheoryNotebookDto',
    type: [CreateTheoryNotebookDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTheoryNotebookDto)
  theoryInput: CreateTheoryNotebookDto[];
}

export class PaginateTheoryFilterDto extends OmitType(PaginateDto, ['search']) {
  @ApiProperty({ description: 'Level của từ/câu lí thuyết', required: false, enum: TheoryLevelEnum })
  @IsOptional()
  @IsEnum(TheoryLevelEnum)
  level?: TheoryLevelEnum;
  
  @ApiProperty({
    default: UnderstandLevelFilterEnum.DEFAULT,
    required: false,
    description: `Chọn option lọc theo mức độ hiểu biết: Mặc định(0), Đã biết(1), Không biết(2), Không chắc(3)`,
    enum: UnderstandLevelFilterEnum
  })
  @IsEnum(UnderstandLevelFilterEnum)
  @IsOptional()
  filter: UnderstandLevelFilterEnum = UnderstandLevelFilterEnum.DEFAULT;

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
