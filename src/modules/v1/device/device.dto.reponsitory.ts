import { BaseAbstractRepository } from "../../../base/mysql/base.abstract.repository";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { UsersDeviceManagerEntity } from "./entities/device.entity";
import { DeviceRepositoryInterface } from "./interfaces/device.repository.interface";

@Injectable()
export class DeviceRepository
  extends BaseAbstractRepository<UsersDeviceManagerEntity>
  implements DeviceRepositoryInterface
{
    constructor(
        @InjectRepository(UsersDeviceManagerEntity)
        private readonly deviceRepository: Repository<UsersDeviceManagerEntity>,
      ) {
        super(deviceRepository);
      }
}
