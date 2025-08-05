import { BaseAbstractRepository } from "../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { PurchaseEntity } from "./entities/purchase.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { PurchaseRepositoryInterface } from "./interfaces/purchase.repository.interface";

@Injectable()
export class PurchaseRepository
  extends BaseAbstractRepository<PurchaseEntity>
  implements PurchaseRepositoryInterface
{
    constructor(
        @InjectRepository(PurchaseEntity)
        private readonly purchaseRepository: Repository<PurchaseEntity>,
      ) {
        super(purchaseRepository);
      }
}
