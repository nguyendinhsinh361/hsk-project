import { BaseAbstractRepository } from "../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { ReasonCancelEntity } from "./entities/reason-cancel.entity";
import { ReasonCancelRepositoryInterface } from "./interfaces/report.repository.interface";

@Injectable()
export class ReasonCancelRepository
  extends BaseAbstractRepository<ReasonCancelEntity>
  implements ReasonCancelRepositoryInterface
{
    constructor(
        @InjectRepository(ReasonCancelEntity)
        private readonly reasonCancelRepository: Repository<ReasonCancelEntity>,
      ) {
        super(reasonCancelRepository);
      }
}
