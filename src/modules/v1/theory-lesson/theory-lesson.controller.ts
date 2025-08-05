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
import { CreateTheoryLessonArrayDto, PaginateTheoryLessonFilterDto } from './dtos/createTheoryLesson.dto';
@ApiTags('Theory')
@Controller('theory-lesson')
export class TheoryLessonController {
  constructor(
    private readonly theoryLessonService: TheoryLessonService, 
  ) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
  @ApiOperation({summary: 'Lấy các từ/câu lí thuyết theo option'})
  @Get()
  async getOptionTheoryLesson(@UserId() user_id: string, @Query() paginateTheoryFilterDto: PaginateTheoryLessonFilterDto) {
    return await this.theoryLessonService.getOptionTheoryLesson(user_id, paginateTheoryFilterDto)
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi trong quá trình tạo' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
  @ApiOperation({summary: 'Tạo/Cập nhập Theory Lesson'})
  @Post()
  async createNewTheoryLesson(@UserId() user_id: string, @Body() data: CreateTheoryLessonArrayDto) {
    return await this.theoryLessonService.createNewTheoryLesson(user_id, data)
  }
}
