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
import { CertificateService } from './certificate.service';
import { CreateCertificateDto } from './dtos/creatCertificate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileUploadCertificateOptions } from '../../../middleware/file.middleware';
import { CertificateTimeService } from '../certifiacte-time/certificate-time.service';
import { PaginateDto } from '../../../common/dtos/paginate.dto';
import { UpdateCertificateDto, UpdateImgCertificateDto } from './dtos/updateCertificate.dto';
@ApiTags('Certificate')
@Controller('certificate')
export class CertificateController {
  constructor(
    private readonly certificateService: CertificateService, 
    private readonly certificateTimeService: CertificateTimeService
  ) {}

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({summary: 'Tạo chứng chỉ mới cho người dùng'})
  @UseInterceptors(FileInterceptor('certificateImg', fileUploadCertificateOptions))
  async createCertificate(
    @UploadedFile() file: Express.Multer.File,
    @UserId() user_id: string,
    @Body() createCertificateDto: CreateCertificateDto,
  ) {
    return await this.certificateService.createCertificate(
      user_id,
      createCertificateDto,
      file.path,
    );
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiOperation({summary: 'Lấy thời gian thông báo người dùng gửi chứng chỉ'})
  @Get('setup-time')
  async setupCertificateTime(
  ) {
    return await this.certificateTimeService.createCertificateTime()
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiOperation({summary: 'Lấy ra tất cả các ảnh chứng chỉ đã được duyệt'})
  @Get()
  async getAllCertificates(@Query() paginateDto: PaginateDto) {
    return await this.certificateService.getAllCertificates(paginateDto)
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiOperation({summary: 'Lấy thông báo chứng chỉ đã được duyệt hay chưa. Có 3 trạng thái: 1. Kích hoạt: 1 - 2. Không kích hoạt: -1 - 3. Trạng thái chờ: 0 - 4.Trạng thái đã xử lý(Duyệt): 2 - 5.Trạng thái đã xử lý(Không duyệt): -2'})
  @Get("notify")
  async getNotificationnActive(@UserId() user_id: string) {
    return await this.certificateService.getNotificationnActive(user_id)
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiOperation({summary: 'Cập nhập trạng thái của chứng chỉ(Test)'})
  @Put("update-certificate/")
  async activeCertificate(@UserId() user_id: string, @Query() updateCertificateDto: UpdateCertificateDto) {
    return await this.certificateService.activeCertificate(user_id, updateCertificateDto)
  }

  @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
  @ApiOperation({summary: 'Cập nhập ảnh người dùng gửi lên'})
  @ApiResponse({ status: HttpStatus.NOT_ACCEPTABLE, description: `File truyền lên phải là ảnh: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp']` })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Ảnh bị lỗi' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('certificateImg', fileUploadCertificateOptions))
  @Put("update-image/")
  async updateImgCertificate(
    @UploadedFile() file: Express.Multer.File,
    @UserId() user_id: string, 
    @Body() updateImgCertificateDto: UpdateImgCertificateDto,
  ) {
    return await this.certificateService.updateImgCertificate(user_id, file.path, updateImgCertificateDto)
  }
}
