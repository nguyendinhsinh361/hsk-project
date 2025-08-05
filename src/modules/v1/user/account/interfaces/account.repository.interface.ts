import { BaseInterfaceRepository } from '../../../../../base/mysql/base.interface.repository';
import { User } from '../entities/user.entity'; 
export type AccountRepositoryInterface = BaseInterfaceRepository<User>;
