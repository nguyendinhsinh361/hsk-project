import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DivinationService } from './divination.service';
import { UserId } from 'src/decorators/get-current-user-id.decorator';
import { CreateHistoryDivinationDto } from './dto/index.dto';
import { CreateInfoUserDto } from './dto/create-info-user-divination.dto';

@ApiTags('divination')
@Controller('divination')
export class DivinationController {
  constructor(private readonly divinationService: DivinationService) {}

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Create error history data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Error create duplicate history data',
  })
  @ApiOperation({ summary: 'Create history divination with user' })
  @Post()
  async createUserHistory(
    @UserId() userId: number,
    @Body() dto: CreateHistoryDivinationDto,
  ) {
    return this.divinationService.createUserHistory(userId, dto);
  }

  @ApiOperation({ summary: 'List history divination with user' })
  @Get()
  async listUserHistory(@UserId() userId: number) {
    return this.divinationService.listHistoryWithByUser(userId);
  }

  @ApiOperation({ summary: 'Get info divination with user' })
  @Get('info-user')
  async getInfoUser(@UserId() userId: number) {
    return this.divinationService.getInfoUser(userId);
  }

  @ApiOperation({ summary: 'Get history One divination with user' })
  @Get(':divinationId')
  async getHistoryWithByUser(
    @UserId() userId: number,
    @Param('divinationId', ParseIntPipe) divinationId: number,
  ) {
    return this.divinationService.getHistoryWithByUser(userId, divinationId);
  }

  @ApiOperation({ summary: 'Create info divination with user' })
  @Post('info-user')
  async createInfoUser(
    @UserId() userId: number,
    @Body() data: CreateInfoUserDto,
  ) {
    return this.divinationService.createInfoUser(userId, data);
  }
}
