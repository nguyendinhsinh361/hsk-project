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
import { TheoryNotebookService } from './theory-notebook.service';
import { CreateTheoryNotebookArrayDto, CreateTheoryNotebookDto, PaginateTheoryFilterDto } from './dtos/createTheoryNotebook.dto';
@ApiTags('Theory')
@Controller('theory-notebook')
export class TheoryNotebookController {
  constructor(
    private readonly theoryNotebookService: TheoryNotebookService, 
  ) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
  @ApiOperation({summary: 'Lấy các từ/câu lí thuyết theo option'})
  @Get()
  async getOptionTheoryNotebook(@UserId() user_id: string, @Query() paginateTheoryFilterDto: PaginateTheoryFilterDto) {
    return await this.theoryNotebookService.getOptionTheoryNotebook(user_id, paginateTheoryFilterDto)
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi trong quá trình tạo' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
  @ApiOperation({summary: 'Tạo/Cập nhập Theory Notebook'})
  @Post()
  async createNewTheoryNotebook(@UserId() user_id: string, @Body() data: CreateTheoryNotebookArrayDto) {
    return await this.theoryNotebookService.createNewTheoryNotebook(user_id, data)
  }
}
