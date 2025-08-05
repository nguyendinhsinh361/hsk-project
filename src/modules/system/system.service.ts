import { Injectable } from '@nestjs/common';
import { SupperPasswordKeyRepository } from './supper-password-key/supper-password-key.reponsitory';

@Injectable()
export class SystemService {
    constructor(
        private readonly supperPasswordKeyRepository: SupperPasswordKeyRepository,
    ) {}
    
    time(){
        return Date.now()
    }

    async genSupperPassword() {
        let prefix = new Date();
        const suffix = "EUP"
        const SALT1 = 37
        const SALT2 = 73
        const SALT3 = 55
        prefix.setMinutes(0, 0, 0);
        const supperPass = Math.floor((+prefix.getTime())/Math.pow(SALT2, 2)*Math.pow(SALT1, 2)*Math.pow(SALT3, 3)).toString(16)
        return `${supperPass}${suffix}`.toUpperCase()
    }

    async createSupperPassword(key_use: string, name: string) {
        const newSupperPass = await this.genSupperPassword()
        const newSupperPassword = {
            superPass: newSupperPass,
            keyUse: key_use,
            keyName: name
        }
        await this.supperPasswordKeyRepository.create(newSupperPassword)
        return {
            superKey: newSupperPassword.superPass
        }
    }

}