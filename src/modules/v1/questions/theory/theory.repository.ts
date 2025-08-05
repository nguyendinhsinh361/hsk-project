import { BaseAbstractRepository } from "../../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { TheoryErrorRepositoryInterface } from "./interfaces/theory.repository.interface";
import { TheoryErrorEntity } from "./entities/theory.entity";

@Injectable()
export class TheoryErrorRepository
  extends BaseAbstractRepository<TheoryErrorEntity>
  implements TheoryErrorRepositoryInterface
{
    constructor(
        @InjectRepository(TheoryErrorEntity)
        private readonly theoryErrorRepository: Repository<TheoryErrorEntity>,
      ) {
        super(theoryErrorRepository);
      }
}
