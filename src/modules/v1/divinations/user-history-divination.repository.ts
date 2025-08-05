import { Injectable } from '@nestjs/common';
import { UserHistoryDivination } from './entities/user-history-divination.entity';
import { BaseAbstractRepository } from 'src/base/mysql/base.abstract.repository';
import { UserHistoryDivinationRepositoryInterface } from './interfaces/user-history-divination.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserHistoryDivinationRepository
  extends BaseAbstractRepository<UserHistoryDivination>
  implements UserHistoryDivinationRepositoryInterface
{
  constructor(
    @InjectRepository(UserHistoryDivination)
    private readonly userHistoryDivinationRepo: Repository<UserHistoryDivination>,
  ) {
    super(userHistoryDivinationRepo);
  }

  async listHistoryWithByUser(userId: number) {
    return await this.userHistoryDivinationRepo
      .createQueryBuilder('history')
      .select([
        'history.divinationId as divinationId',
        'infoUserDivination.userId as userId',
        'infoUserDivination.username as username',
        'infoUserDivination.birthday as birthday',
        "GROUP_CONCAT(history.contentId SEPARATOR ',') as contentIds",
        'MIN(history.createdAt) as createdAt',
      ])
      .innerJoin('history.infoUserDivination', 'infoUserDivination')
      .where('infoUserDivination.userId = :userId', { userId })
      .groupBy('history.divinationId')
      .addGroupBy('infoUserDivination.userId')
      .addGroupBy('infoUserDivination.username')
      .addGroupBy('infoUserDivination.birthday')
      .orderBy('createdAt', 'ASC')
      .getRawMany();
  }

  async getHistoryWithByUser(userId: number, divinationId: number) {
    return await this.userHistoryDivinationRepo
      .createQueryBuilder('history')
      .select([
        'history.divinationId as divinationId',
        'infoUserDivination.username as username',
        'infoUserDivination.birthday as birthday',
        'history.contentId as contentId',
        'history.createdAt as createdAt',
      ])
      .innerJoin('history.infoUserDivination', 'infoUserDivination')
      .where('history.userId = :userId', { userId })
      .where('history.divinationId = :divinationId', { divinationId })
      .orderBy('history.createdAt', 'DESC')
      .getRawMany();
  }
}
