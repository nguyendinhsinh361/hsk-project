import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { BaseAbstractRepository } from '../../../../base/mysql/base.abstract.repository';
import { Repository } from 'typeorm';
import { RankingEntity } from '../entities/ranking.entity';
import { RankingsRepositoryInterface } from '../interfaces/ranking.repository.interface';

@Injectable()
export class RankingRepository
  extends BaseAbstractRepository<RankingEntity>
  implements RankingsRepositoryInterface
{
    constructor(
        @InjectRepository(RankingEntity)
        private readonly rankingRepository: Repository<RankingEntity>,
      ) {
        super(rankingRepository);
      }
}
