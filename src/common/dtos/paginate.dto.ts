import { ApiProperty, PickType, OmitType} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min, Validate } from 'class-validator';
import { KindQuestion } from '../../modules/v1/practice-writing/enums/kindQuestion.enum';
import { FilterCommentOption, FilterOption } from '../../modules/v1/practice-writing/enums/filterOption.enum';


export class PaginateDto {
  @ApiProperty({
    default: 1,
    description: `Please enter page`,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  page?: number = 1;


  @ApiProperty({
    default: 10,
    description: `Please enter limit in page`,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Limit must be greater than or equal to 1' })
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

export class PaginateCommentFilterDto extends OmitType(PaginateDto, ['search']) {
  @ApiProperty({
    default: FilterOption.DEFAULT,
    required: false,
    description: `Please enter filter option`,
    enum: FilterCommentOption
  })
  @IsEnum(FilterCommentOption)
  @IsOptional()
  filter?: FilterCommentOption = FilterCommentOption.DEFAULT;
}


export class PaginateFilterDto extends OmitType(PaginateDto, ['search']) {
  @ApiProperty({
    default: KindQuestion.KIND_430002,
    required: true,
    description: `Please enter type question`,
    enum: KindQuestion
  })
  @IsEnum(KindQuestion)
  kind: KindQuestion = KindQuestion.KIND_430002;

  @ApiProperty({
    default: FilterOption.DEFAULT,
    required: false,
    description: `Please enter filter option`,
    enum: FilterOption
  })
  @IsEnum(FilterOption)
  @IsOptional()
  filter?: FilterOption = FilterOption.DEFAULT;
}