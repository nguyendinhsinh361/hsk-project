import { BaseAbstractRepository } from "../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { AccessToken } from "./entities/token.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { AccessTokenRepositoryInterface } from "./interfaces/auth.repository.interface";

@Injectable()
export class AuthRepository
  extends BaseAbstractRepository<AccessToken>
  implements AccessTokenRepositoryInterface
{
    constructor(
        @InjectRepository(AccessToken)
        private readonly authRepository: Repository<AccessToken>,
      ) {
        super(authRepository);
      }
}
