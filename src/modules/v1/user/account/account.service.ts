import { AccountRepositoryInterface } from './interfaces/account.repository.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegiterDto } from './dtos/regiter.dto';
import { AccountRepository } from './account.repository';
import { HttpService } from "@nestjs/axios";

@Injectable()
export class AccountService {
    constructor(
        private readonly accountRepository: AccountRepository,
        private httpService: HttpService
    ) { }

    async regiter(input: any) {
        return this.accountRepository.create(input)
    }

    async deactiveAccount(id: number): Promise<any> {
        return await this.accountRepository.update({ id }, { activate_flag: -1 })
    }

    async activeAccount(id: number): Promise<any> {
        return await this.accountRepository.update({ id }, { activate_flag: null })
    }

    async find(input: any) {
        return this.accountRepository.findByCondition(input)
    }

    async findAll(input: any) {
        return this.accountRepository.findAll(input)
    }

    async getDataRequests(url: string): Promise<any> {
        return this.httpService.axiosRef({
            url,
            method: 'GET'
        });
    }

    async updateUserInformation(userId, name = '', day_of_birth = null, month_of_birth = null, year_of_birth = null, sex: number = null, phone: string = null, country: string = null) {
        var sqlUpdate = `UPDATE users SET `
        let sql_arr = [];
        const paramQuery = []
        if (name != '') {
            sql_arr.push(` name = ? `)
            paramQuery.push(name)
        }
        if (day_of_birth != null) {
            sql_arr.push(` day_of_birth = ? `)
            paramQuery.push(day_of_birth)
        }

        if (month_of_birth != null) {
            sql_arr.push(` month_of_birth = ? `)
            paramQuery.push(month_of_birth)
        }
        if (year_of_birth != null) {
            sql_arr.push(` year_of_birth = ? `)
            paramQuery.push(year_of_birth)
        }
        if (sex != null) {
            sql_arr.push(` sex = ? `)
            paramQuery.push(sex)
        }
        if (phone != null) {
            sql_arr.push(` phone = ? `)
            paramQuery.push(phone)
        }
        if (country != null) {
            sql_arr.push(` country = ? `)
            paramQuery.push(country)
        }


        if (sql_arr.length == 0) {
            throw new HttpException("Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST)
        } else {
            sqlUpdate += sql_arr.join(', ') + ` where id = ?`;
            paramQuery.push(userId)
            let resultQuery = await this.accountRepository.query(sqlUpdate, paramQuery)
            if (resultQuery.affectedRows > 0) {
                return { "message": "Successfull" }
            } else {
                return { "message": "Cập nhật không thành công" }
            }
        }
    }

}