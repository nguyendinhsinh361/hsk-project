import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserHistoryDivinationRepository } from './user-history-divination.repository';
import { CreateHistoryDivinationDto } from './dto/index.dto';
import { InfoUserDivinationRepository } from './info-user-divination.repository';
import { CreateInfoUserDto } from './dto/create-info-user-divination.dto';

@Injectable()
export class DivinationService {
  constructor(
    private readonly userHistoryDivinationRepo: UserHistoryDivinationRepository,
    private readonly infoUserDivinationRepository: InfoUserDivinationRepository,
  ) {}

  async createUserHistory(userId: number, dto: CreateHistoryDivinationDto) {
    try {
      await this.validateCreateHistory(userId, dto);

      return await this.userHistoryDivinationRepo.create({
        infoUserDivinationId: dto.infoUserId,
        divinationId: dto.divinationId,
        contentId: dto.contentId,
      });
    } catch (error) {
      throw new BadRequestException('Error create history data');
    }
  }

  private async validateCreateHistory(
    userId: number,
    dto: CreateHistoryDivinationDto,
  ) {
    const checkInfoUser = await this.infoUserDivinationRepository.findOne({
      where: {
        userId,
        id: dto.infoUserId,
      },
    });

    if (!checkInfoUser) {
      throw new NotFoundException('Info user not found');
    }

    const checkData = await this.userHistoryDivinationRepo.findOne({
      where: {
        infoUserDivinationId: dto.infoUserId,
        divinationId: dto.divinationId,
        contentId: dto.contentId,
      },
    });

    if (checkData) {
      throw new ConflictException('Error create duplicate history data');
    }
  }

  async listHistoryWithByUser(userId: number) {
    return await this.userHistoryDivinationRepo.listHistoryWithByUser(userId);
  }

  async getHistoryWithByUser(userId: number, divinationId: number) {
    return await this.userHistoryDivinationRepo.getHistoryWithByUser(
      userId,
      divinationId,
    );
  }

  async getInfoUser(userId: number) {
    return (
      (await this.infoUserDivinationRepository.findOne({
        where: {
          userId,
        },
        order: {
          id: 'DESC',
        },
      })) || {}
    );
  }

  async createInfoUser(userId: number, data: CreateInfoUserDto) {
    return await this.infoUserDivinationRepository.create({
      userId,
      username: data.username,
      birthday: data.birthday,
    });
  }
}
