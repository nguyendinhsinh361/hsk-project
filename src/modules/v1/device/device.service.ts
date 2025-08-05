import { Injectable } from '@nestjs/common';
import { DeviceRepository } from './device.dto.reponsitory';

@Injectable()
export class DeviceService {
    constructor(private readonly deviceRepository: DeviceRepository) {}
    
    async getDeviceId(userId: number){
        let listDevice: any = await this.deviceRepository.query("select device_id from users_device_manager where user_id = ? and active = 1 group by device_id limit 3", [userId])
        let devices = []
        for(var index=0; index<listDevice.length; index++){
            devices.push(listDevice[index]["device_id"])
        }
        return devices
    }

    async save(input: any){
        let listDevice: any = await this.deviceRepository.query("select id from users_device_manager where user_id = ? and device_id = ? and active = 1 limit 1", [input.userId, input.deviceId])
        if (listDevice.length == 0){
            return this.deviceRepository.create(input)
        }else{
            return {}
        }
    }

    async update(condition: any, dataUpdate: any){
        return this.deviceRepository.update(condition, dataUpdate)
    }
    
    replaceEmoji(str) {
        return str.replace(/[\u{1F600}-\u{1F64F}]/gu, '_') // Mặt cười
                  .replace(/[\u{1F300}-\u{1F5FF}]/gu, '_') // Ký tự khác
                  .replace(/[\u{1F680}-\u{1F6FF}]/gu, '_') // Biểu tượng giao thông
                  .replace(/[\u{1F700}-\u{1F77F}]/gu, '_') // Ký tự Alchemical
                  .replace(/[\u{1F780}-\u{1F7FF}]/gu, '_') // Ký tự Geometric
                  .replace(/[\u{1F800}-\u{1F8FF}]/gu, '_') // Ký tự Supplement
                  .replace(/[\u{1F900}-\u{1F9FF}]/gu, '_') // Ký tự Supplemental Symbols
                  .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '_') // Ký tự Chess
                  .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '_'); // Ký tự Symbols and Pictographs
      }
}