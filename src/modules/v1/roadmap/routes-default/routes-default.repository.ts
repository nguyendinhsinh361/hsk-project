import { BaseAbstractRepository } from "../../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { RoutesDefaultEntity } from "./entities/routes-default.entity";
import { RoutesDefaultRepositoryInterface } from "./interfaces/routes-default.repository.interface";

@Injectable()
export class RoutesDefaultRepository
  extends BaseAbstractRepository<RoutesDefaultEntity>
  implements RoutesDefaultRepositoryInterface
{
    constructor(
        @InjectRepository(RoutesDefaultEntity)
        private readonly routesDefaultRepository: Repository<RoutesDefaultEntity>,
      ) {
        super(routesDefaultRepository);
      }
}
