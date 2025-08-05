import { BaseAbstractRepository } from "../../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { AccountRepositoryInterface } from "./interfaces/account.repository.interface"; 

@Injectable()
export class AccountRepository
  extends BaseAbstractRepository<User>
  implements AccountRepositoryInterface
{
    constructor(
        @InjectRepository(User)
        private readonly accountRepository: Repository<User>,
      ) {
        super(accountRepository);
      }
}
