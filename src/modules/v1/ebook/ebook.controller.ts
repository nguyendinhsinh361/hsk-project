import {
  Body,
  Controller,
  Delete,
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
import { EbookService } from './ebook.service';
import { CreateEbookDto, PaginateEbookFilterDto, SynchronizeEbookUserArrayDto, UpdateEbookDetail } from './dtos/ebook.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetSupperKey } from 'src/decorators/get-supper-key.decorator';
@ApiTags('Ebook')
@Controller('ebook')
export class EbookController {
  constructor(
    private readonly ebookService: EbookService, 
  ) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Không tìm thấy ebook' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi trong quá trình lấy ebook' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
  @ApiOperation({summary: 'Lấy ebook theo option của user'})
  @Get()
  async getOptionEbook(@UserId() user_id: string, @Query() paginateEbookFilterDto: PaginateEbookFilterDto) {
    return await this.ebookService.getOptionEbook(user_id, paginateEbookFilterDto)
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi trong quá trình tạo mới ebook' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
  @ApiOperation({summary: 'Tạo mới Ebook'})
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('ebookData'))
  @Post("/")
  async createEbookUser(@UploadedFile() file: Express.Multer.File, @Body() createEbookDto: CreateEbookDto) {
    return await this.ebookService.createNewEbook(file)
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi trong quá trình tạo mới ebook' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
  @ApiOperation({summary: 'Update data chi tiết 1 ebook'})
  @Put("/:ebookId")
  async updateEbookDetail(@GetSupperKey() key_use: string, @Param("ebookId") ebookId: string, @Body() updateEbookDetail: UpdateEbookDetail) {
    return await this.ebookService.updateEbookDetail(key_use, ebookId, updateEbookDetail)
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Thành công' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Xảy ra lỗi trong quá trình đồng bộ ebook cho user' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
  @ApiOperation({summary: 'Đồng bộ ebook vào user'})
  @Post("/synchronize")
  async synchorizeEbookUser(@UserId() user_id: string, @Body() synchronizeEbookUserArrayDto: SynchronizeEbookUserArrayDto) {
    return await this.ebookService.synchorizeEbookUser(user_id, synchronizeEbookUserArrayDto)
  }
}
