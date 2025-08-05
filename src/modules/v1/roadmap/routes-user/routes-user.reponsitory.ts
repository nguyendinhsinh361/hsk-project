import { BaseAbstractRepository } from "../../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { RoutesUserEntity } from "./entities/routes-user.entity";
import { RoutesUserRepositoryInterface } from "./interfaces/routes-user.repository.interface";

@Injectable()
export class RoutesUserRepository
  extends BaseAbstractRepository<RoutesUserEntity>
  implements RoutesUserRepositoryInterface
{
    constructor(
        @InjectRepository(RoutesUserEntity)
        private readonly routesUserRepository: Repository<RoutesUserEntity>,
      ) {
        super(routesUserRepository);
      }
}
