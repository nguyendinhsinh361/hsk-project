import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserTrackingRepository } from './user-tracking.repository';
import { Tracking } from './dtos/user-tracking.dto';

@Injectable()
export class UserTrackingService {
    constructor(
        private readonly UserTrackingRepository: UserTrackingRepository,
    ) { }
    async createUserTracking(userId: number, content: Tracking[]) {
        const placeholderSql = []
        const valuesInsert = []
        let placeholderString = ""
        content.forEach((value) => {
            placeholderSql.push("(?,?)")
            if (!value?.tag) {
                throw new HttpException("Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST)
            }
            valuesInsert.push(userId, value.tag)

        })
        placeholderString = placeholderSql.join(",")
        let sql = `insert ignore into users_tracking (user_id, tag) values ${placeholderString}`;
        let resultQuery = await this.UserTrackingRepository.query(sql, valuesInsert)

        return "successfull"
    }

}