import { ApiProperty, OmitType, PickType } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested  } from "class-validator";
import { ChatGPTHSK4_430002ExampleEnum, ChatGPTHSK5_530002ExampleEnum, ChatGPTHSK5_530003ExampleEnum, ChatGPTHSK6_630001ExampleEnum } from "../../chatgpt/enums/chatGPT.enum";
import { BooleanEbookEnum } from "../../ebook/enums/ebook.enum";
import { Type } from "class-transformer";
import { PaginateDto } from "src/common/dtos/paginate.dto";
import { TheoryLevelEnum } from "../../theory-notebook/enums/theoryNotebook.enum";

export class CreateMissionDto {
    @ApiProperty({
      description: '',
      type: String,
      format: 'binary',
      required: true,
    })
    missionData: string;
}

export class CreateRankingnDto {
  @ApiProperty({
    description: '',
    type: String,
    format: 'binary',
    required: true,
  })
  rankingData: string;
}

export class SynchronizeMissionsUsersDto {
    @ApiProperty({ description: '', required: true, default: 0 })
    @IsNotEmpty()
    @IsNumber()
    id: number;
    
    @ApiProperty({ description: 'Nhập tiến độ số lượng đã hoàn thành', default: 0 })
    @IsNotEmpty()
    @IsNumber()
    mission_progress: number;
}
  
export class SynchronizeMissionsUsersArrayDto {
    @ApiProperty({
      description: 'Mảng các đối tượng SynchronizeMissionsUsersDto',
      type: [SynchronizeMissionsUsersDto],
    })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SynchronizeMissionsUsersDto)
    synchronizedMission: SynchronizeMissionsUsersDto[];
  }

export class PaginateRankingFilterDto extends OmitType(PaginateDto, ['search']) {}

export class MissionOptionDto {
  @ApiProperty({
    description: 'Nhập level',
    enum: TheoryLevelEnum,
    required: true,
  })
  @IsEnum(TheoryLevelEnum)
  level: TheoryLevelEnum = TheoryLevelEnum.LEVEL_1;
}