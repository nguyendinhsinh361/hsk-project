import { BaseInterfaceRepository } from '../../../../base/mysql/base.interface.repository';
import { UsersDeviceManagerEntity } from '../entities/device.entity'; 
export type DeviceRepositoryInterface = BaseInterfaceRepository<UsersDeviceManagerEntity>;
