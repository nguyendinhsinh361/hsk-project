import { BaseAbstractRepository } from "../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { UserSynchronizedPracticeEntity } from "./entities/users-synchronized-practice.entity";
import { UserSynchronizedPracticeRepositoryInterface } from "./interfaces/users-synchronized-practice.repository.interface";

@Injectable()
export class UserSynchronizedPracticeRepository
  extends BaseAbstractRepository<UserSynchronizedPracticeEntity>
  implements UserSynchronizedPracticeRepositoryInterface
{
    constructor(
        @InjectRepository(UserSynchronizedPracticeEntity)
        private readonly userSynchronizedPracticeRepository: Repository<UserSynchronizedPracticeEntity>,
      ) {
        super(userSynchronizedPracticeRepository);
      }
}
