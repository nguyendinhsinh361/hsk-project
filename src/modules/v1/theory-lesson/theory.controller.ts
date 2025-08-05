import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { UserId } from '../../../decorators/get-current-user-id.decorator';
import { TheoryLessonService } from './theory-lesson.service';
import { CreateTheoryLessonArrayDto, PaginateTheoryLessonFilterDto, TheoryVersiontDto } from './dtos/createTheoryLesson.dto';
@ApiTags('Theory')
@Controller('theory')
export class TheoryController {
  constructor(
    private readonly theoryLessonService: TheoryLessonService, 
  ) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
  @ApiOperation({summary: 'Lấy thông tin về version mới nhất của Lí thuyết'})
  @Get("version")
  async getTheoryVersion(@Query() theoryVersiontDto: TheoryVersiontDto) {
    return await this.theoryLessonService.getTheoryVersion(theoryVersiontDto)
  }
}