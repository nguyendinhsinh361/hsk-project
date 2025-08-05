import { BaseAbstractRepository } from "src/base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { UserTracking } from "./entities/user-tracking.entity";
import { UserTrackingRepositoryInterface } from "./interfaces/user-tracking.repository.interface";

@Injectable()
export class UserTrackingRepository
  extends BaseAbstractRepository<UserTracking>
  implements UserTrackingRepositoryInterface {
  constructor(
    @InjectRepository(UserTracking)
    private readonly UserTrackingRepository: Repository<UserTracking>,
  ) {
    super(UserTrackingRepository);
  }
}
