import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEmpty, IsEnum, IsIn, isNotEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PaginateDto } from '../../../../common/dtos/paginate.dto';
import { BooleanEbookEnum, OptionEbookEnum, TypeEbookEnum } from '../enums/ebook.enum';
import { Type } from 'class-transformer';

export class CreateEbookDto {
  @ApiProperty({
    description: '',
    type: String,
    format: 'binary',
    required: true,
  })
  ebookData: string;
}

export class PaginateEbookFilterDto extends OmitType(PaginateDto, ['search']) {
  @ApiProperty({ description: '', required: true, default: "vi"})
  @IsNotEmpty()
  @IsString()
  lang: string = "vi";

  @ApiProperty({ description: '', required: false, default: OptionEbookEnum.DEFAULT, enum: OptionEbookEnum })
  @IsOptional()
  @IsEnum(OptionEbookEnum)
  filter: OptionEbookEnum = OptionEbookEnum.DEFAULT;
  
  @ApiProperty({
    default: TypeEbookEnum.DEFAULT,
    required: false,
    description: ``,
    enum: TypeEbookEnum
  })
  @IsEnum(TypeEbookEnum)
  @IsOptional()
  type: TypeEbookEnum = TypeEbookEnum.DEFAULT
}


export class SynchronizeEbookUserDto {
  @ApiProperty({ description: '', required: true, default: 0 })
  @IsNotEmpty()
  @IsNumber()
  ebook_id: number;
  
  @ApiProperty({ description: 'Nhập tỉ lệ hoàn thành của ebook', default: 0 })
  @IsNumber()
  progress: number;

  @ApiProperty({ description: '', required: false, enum: BooleanEbookEnum, default: BooleanEbookEnum.FALSE })
  @IsEnum(BooleanEbookEnum)
  @IsOptional()
  is_favourite?: BooleanEbookEnum;

  @ApiProperty({ description: '', required: false})
  @IsOptional()
  @IsNumber()
  page_checkpoint?: number;

  @ApiProperty({ description: '', required: false, enum: BooleanEbookEnum, default: BooleanEbookEnum.FALSE})
  @IsEnum(BooleanEbookEnum)
  @IsOptional()
  is_downloaded?: BooleanEbookEnum;
}

export class SynchronizeEbookUserArrayDto {
  @ApiProperty({
    description: 'Mảng các đối tượng SynchronizeEbookUserDto',
    type: [SynchronizeEbookUserDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SynchronizeEbookUserDto)
  synchronizedEbook: SynchronizeEbookUserDto[];
}

export class UpdateEbookDetail {
  @ApiProperty({
    description: '',
    required: false
  })
  @IsOptional()
  cover_img_url?: string;

  @ApiProperty({
    description: '',
    required: false
  })
  @IsOptional()
  pdf_url?: string;

  @ApiProperty({
    description: '',
    required: false
  })
  @IsOptional()
  audio_url?: string;

  
}