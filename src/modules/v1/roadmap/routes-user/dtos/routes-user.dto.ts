import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { RouteLevelEnum } from "../../routes-default/enums/route-level.enum";
import { TypeRouteUserEnum } from "src/modules/v1/practice-writing/enums/kindQuestion.enum";
import { TheoryLevelEnum } from "src/modules/v1/theory-notebook/enums/theoryNotebook.enum";
import { Type } from "class-transformer";

export class RoutesUserDto {
    @ApiProperty({ description: 'Nhập level', required: true, default: RouteLevelEnum.LEVEL_1030, enum: RouteLevelEnum})
    @IsEnum(RouteLevelEnum)
    @IsNotEmpty()
    level: RouteLevelEnum = RouteLevelEnum.LEVEL_1030;
}

export class RoutesUserDetailDto {
    @ApiProperty({ description: 'Nhập level', required: true, default: TheoryLevelEnum.LEVEL_1, enum: TheoryLevelEnum})
    @IsEnum(TheoryLevelEnum)
    @IsNotEmpty()
    level: TheoryLevelEnum = TheoryLevelEnum.LEVEL_1;
}

export class QuestionDto {
    @ApiProperty({ description: 'ID của câu hỏi', example: 42531 })
    @IsNumber()
    id: number;
  
    @ApiProperty({ description: 'Giá trị đúng của câu hỏi', example: 1 })
    @IsNumber()
    true: number;
  
    @ApiProperty({ description: 'Giá trị sai của câu hỏi', example: 0 })
    @IsNumber()
    false: number;
}

export class QuestionResultRouteDto {
    @ApiProperty({ type: [QuestionDto], description: 'Danh sách các câu hỏi', required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    @IsOptional()
    questions: QuestionDto[];

    @ApiProperty({ description: 'ID của đề thi (Nếu type là test)', example: 42531, required: false })
    @IsNumber()
    @IsOptional()
    test_id: number;

    @ApiProperty({ description: 'Loại HSK', example: TypeRouteUserEnum.PRACTICE, required: false })
    @IsEnum(TypeRouteUserEnum)
    @IsOptional()
    type?: TypeRouteUserEnum = TypeRouteUserEnum.PRACTICE;

    @ApiProperty({ description: 'Điểm viết', example: 60, required: false })
    @IsNumber()
    @IsOptional()
    write_score?: number;

    @ApiProperty({ description: 'Điểm đọc', example: 63, required: false })
    @IsNumber()
    @IsOptional()
    read_score?: number;

    @ApiProperty({ description: 'Điểm nghe', example: 58, required: false })
    @IsNumber()
    @IsOptional()
    listen_score?: number;

    @ApiProperty({ description: 'Thời gian bắt đầu xử lý', example: 1728060924, required: false })
    @IsNumber()
    @IsOptional()
    time_start_process?: number;
  
    @ApiProperty({ description: 'Thời gian kết thúc xử lý', example: 1728061149, required: false })
    @IsNumber()
    @IsOptional()
    time_end_process?: number;
  
    @ApiProperty({ description: 'Tổng điểm đạt được', example: 181, required: false })
    @IsNumber()
    @IsOptional()
    sum_score?: number;
  
    @ApiProperty({ description: 'Điểm tối đa có thể đạt được', example: 300, required: false })
    @IsNumber()
    @IsOptional()
    max_score?: number;

    @ApiProperty({ description: 'Đã đạt yêu cầu', example: 0, required: false })
    @IsNumber()
    @IsOptional()
    pass?: number;
  }

export class RoutesUserUpdateDto {
    @ApiProperty({ description: 'ID của lộ trình đang làm', example: 42531 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'Là id_route của object trong field {route}', example: 0 })
    @IsNumber()
    id_route: number = 0;

    @ApiProperty({ description: 'Là id_day của object trong field {detail} trong {route}', example: 0 })
    @IsNumber()
    id_day: number = 0;

    @ApiProperty({ description: 'Là id_process của object trong field {process} trong {route} => {detail}', example: 0 })
    @IsNumber()
    id_process: number = 0;
    
    @ApiProperty({
        type: QuestionResultRouteDto,
        required: true,
    })
    @ValidateNested({ each: true })
    @Type(() => QuestionResultRouteDto)
    result: QuestionResultRouteDto;
}

export class RoutesUserResettDto {
    @ApiProperty({ description: 'ID của lộ trình đang làm', example: 42531 })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'Là index của object trong field {route} bạn muốn reset', example: 0 })
    @IsNumber()
    index_route: number = 0;
}