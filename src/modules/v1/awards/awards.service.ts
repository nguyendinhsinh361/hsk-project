import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path'
import { ConfigService } from '@nestjs/config';
const fileName = 'src/config/verified/google/api-5471876505635454505-5249-ae6fd8d08044.json'
const projectPath = process.cwd()
const filePath = path.resolve(projectPath, fileName)
const PACKAGE_NAME = "com.eup.migiihsk"
import axios, { AxiosRequestConfig } from 'axios';
const MIA_TEST = 'uploads/mia/user-test.json'
const fileListUserTest = path.resolve(projectPath, MIA_TEST)
import * as fs from 'fs'
import { PurchaseService } from '../purchase/purchase.service';
import { AwardsMiADto, ListUserCustomDto, UserCustomDto } from './dtos/awards.dto';
import { ProductTypeEnum } from '../purchase/enum/product-type.enum';
import { IResponse } from '../../../common/interfaces/response.interface';
import { AccountService } from '../user/account/account.service';
import { EventPrizeService } from '../event_prize/event-prize.service';
import { EventService } from '../event/event.service';
import { EventNameEnum } from './enum/event-name.enum';
import { KindTestEnum } from '../scoring/enums/kind.enum';
import * as Sentry from "@sentry/node";
import { PurchaseRepository } from '../purchase/purchase.reponsitory';
@Injectable()
export class AwardsService {
    constructor(
        private readonly configService: ConfigService,
        private readonly purchaseService: PurchaseService,
        private readonly purchaseRepository: PurchaseRepository,
        private readonly accountService: AccountService,
        private readonly eventPrizeService: EventPrizeService,
        private readonly eventService: EventService,
    ) {}
    async readJsonFile(filePath: string): Promise<any> {
        try {
          const fileContent = await fs.promises.readFile(filePath, 'utf8');
          return JSON.parse(fileContent);
        } catch (error) {
          console.error('Failed to read file:', error);
          throw new Error('Failed to read file');
        }
    }

    async awardTrialMiACustomByEmail(awardsMiADto: AwardsMiADto, listUserTrialDto: ListUserCustomDto, user_id: string) {
        try {
            const currentTime = Date.now()

            const miaTotal = +awardsMiADto.miaTotal
            const listUser = listUserTrialDto.emails
            for(let index = 0; index < listUser.length; index++) {
                const currentUserId = await this.accountService.find({email: `${listUser[index]}`})

                const premiumUserCurrentRaw = await this.purchaseRepository.query(`SELECT purchase_date, time_expired, product_id, product_type FROM purchase WHERE id_user = ? AND active = 1 AND time_expired > ? ORDER BY time_expired DESC LIMIT 1`, [+currentUserId.id, currentTime])
         
                const premiumTimeAward = (+awardsMiADto.premiumTime) * 86400000 
                const timeExpired = premiumUserCurrentRaw.length ? +premiumUserCurrentRaw[0].time_expired + premiumTimeAward : currentTime + premiumTimeAward 

                const note = `${awardsMiADto.eventName}: [Thời gian sử dụng Premium: ${awardsMiADto.premiumTime} Ngày; Lượt chấm: ${miaTotal}]`
                const newPurchaseMia = {
                    idUser: currentUserId.id,
                    productId: "migii_hsk_mia_custom",
                    platforms: "web",
                    purchaseDate: currentTime,
                    timeExpired: timeExpired,
                    active: 1,
                    note: note,
                    miaTotal: miaTotal,
                    productType: ProductTypeEnum.PRODUCT_TYPE_MIA,
                    originMiaTotal: miaTotal
                }
                await this.purchaseService.craeteNewPurchaseCustomMia(newPurchaseMia)
            }
            const response: IResponse = {
                message: "Create new purchase for custorm miA successfully!!!",
                data: {}
            }
            return response
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            const response: IResponse = {
                message: "Create new purchase for custorm miA failed.",
                data: {}
            }
            throw new HttpException(response, HttpStatus.BAD_REQUEST)  
        }
    }

    async awardTrialMiAMine(userCustomDto: UserCustomDto, user_id: string) {
        try {
            const KEY_EVENT = 'TRIAL_MIA_3DAYS_3SCORING_HSK456'
            const TRIAL_DAY = 3
            const TRIAL_MIA = 3
            const currentTime = Date.now()
            const timeExpired = currentTime + TRIAL_DAY * 86400000
            const miaTotal = TRIAL_MIA
            const currentUserId = await this.accountService.find({id: user_id})
            const note = `${KEY_EVENT}_${user_id}_${currentUserId.email}`
            const transactionId = `${userCustomDto.info}`
            const newPurchaseMia = {
                idUser: currentUserId.id,
                productId: "migii_hsk_mia_custom",
                platforms: "web",
                purchaseDate: currentTime,
                timeExpired: timeExpired,
                active: 1,
                transactionId: transactionId,
                note: note,
                miaTotal: miaTotal,
                productType: ProductTypeEnum.PRODUCT_TYPE_MIA,
                originMiaTotal: miaTotal
            }
            const checkUserGetTrial = await this.purchaseService.findByNote({note})
            if(checkUserGetTrial) {
                const response: IResponse = {
                    message: "Bạn chỉ được nhận lượt dùng thử 1 lần cho một tài khoản.",
                    data: {}
                }
                throw new HttpException(response, HttpStatus.CONFLICT)
            }
            await this.purchaseService.craeteNewPurchaseCustomMia(newPurchaseMia)
            const response: IResponse = {
                message: "Bạn đã nhận thành công lượt dùng thử.",
                data: await this.purchaseService.getPurchaseByUserId(+user_id)
            }
            return response
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error;
            }
            const response: IResponse = {
                message: "Xảy ra lỗi trong quá trình nhận.",
                data: {}
            }
            throw new HttpException(response, HttpStatus.BAD_REQUEST)
        }
    }

    async awardTrialMiACustomByUserId(awardsMiADto: AwardsMiADto, user_id: string) {
        try {
            const currentTime = Date.now()
            const premiumUserCurrentRaw = await this.purchaseRepository.query(`SELECT purchase_date, time_expired, product_id, product_type FROM purchase WHERE id_user = ? AND active = 1 AND time_expired > ? ORDER BY time_expired DESC LIMIT 1`, [+user_id, currentTime])
         
            const premiumTimeAward = (+awardsMiADto.premiumTime) * 86400000 
            const timeExpired = premiumUserCurrentRaw.length ? +premiumUserCurrentRaw[0].time_expired + premiumTimeAward : currentTime + premiumTimeAward 

            const miaTotal = +awardsMiADto.miaTotal
            const note = `${awardsMiADto.eventName}: [Thời gian sử dụng Premium: ${awardsMiADto.premiumTime} Ngày; Lượt chấm: ${miaTotal}]`
            const newPurchaseMia = {
                idUser: user_id,
                productId: "migii_hsk_mia_custom",
                platforms: "web",
                purchaseDate: currentTime,
                timeExpired: timeExpired,
                active: 1,
                note: note,
                miaTotal: miaTotal,
                productType: ProductTypeEnum.PRODUCT_TYPE_MIA,
                originMiaTotal: miaTotal
            }
            await this.purchaseService.craeteNewPurchaseCustomMia(newPurchaseMia)
        } catch (error) {
            console.log(error)
            throw new HttpException("ERROR", HttpStatus.BAD_REQUEST)  
        }
    }

    async getUniqueUserFromLevel(data) {
        const userIds = new Set();
        const result = data
        .sort((a, b) => b.level - a.level)
        .map(levelObj => ({
            level: levelObj.level,
            data: levelObj.data.filter(userObj => {
            if (!userIds.has(userObj.user_id)) {
                userIds.add(userObj.user_id);
                return true;
            }
                return false;
            })
        }))
        .filter(levelObj => levelObj.data.length > 0);
        return result
    }

    async awardPrizeTestOnline() {
        const TOP1 = 1
        const TOP3 = 3
        const TOP20 = 20
        const MIN_SCORE = 50
        const USER_ID_DEFAULT = "425138"
        const listEventNewest = await this.eventService.getEventNewest()
        if(!listEventNewest.length) {
            throw new HttpException('Không có sự kiện nào được kích hoạt.', HttpStatus.NOT_FOUND)
        }
        try {
            const listAllUserInAllEvent = []
            for (const event of listEventNewest) {
                const listUserInTop20Raw = await this.eventService.getEventRankForUser(USER_ID_DEFAULT, {
                    event_id: (event.event_id).toString(),
                    page: 1,
                    limit: 20,
                })
                const listUserInTop20 = (listUserInTop20Raw.data.event_online_ranking).map(ele => {
                    return {
                        ...ele,
                        level: event.level,
                        event_id: event.event_id
                    }
                });
                listAllUserInAllEvent.push({data: listUserInTop20, level: event.level}) 
            } 

            const allUserJoinEventTop20Raw = (listAllUserInAllEvent.map(ele => ele.data)).flat()
            const eventPrizeDataToSave = allUserJoinEventTop20Raw.map(ele => {
                return {
                    user_id: ele.user_id,
                    event_id: ele.event_id,
                    active: 1,
                    rank: ele.rank_index,
                    level: ele.level,
                }
            })
            await this.eventPrizeService.createMultipleEventPrize(eventPrizeDataToSave)
            const uniqueUserFromLevelAwardsRaw = await this.getUniqueUserFromLevel(listAllUserInAllEvent) 
            const uniqueUserFromLevelAwards = (uniqueUserFromLevelAwardsRaw.map(ele => ele.data)).flat()
            for (const awardUser of uniqueUserFromLevelAwards) {
                let miaTotal = 0
                let premiumTime = 0
                const checkLevelHSK456 = +awardUser.level == KindTestEnum.HSK4 || +awardUser.level == KindTestEnum.HSK5 || +awardUser.level == KindTestEnum.HSK6
                if(+awardUser.rank_index == TOP1) {
                    if(checkLevelHSK456) miaTotal = 10
                    premiumTime = 30
                } else if(+awardUser.rank_index <= TOP3) {
                    if(checkLevelHSK456) miaTotal = 5
                    premiumTime = 14
                } else if(+awardUser.rank_index <= TOP20) {
                    if(checkLevelHSK456) miaTotal = 1
                    premiumTime = 5
                }
                if(+awardUser.score >= MIN_SCORE) {
                    await this.awardTrialMiACustomByUserId({
                        eventName: EventNameEnum.ONLINE_EVENT,
                        premiumTime: premiumTime.toString(),
                        miaTotal: miaTotal.toString()
                    }, awardUser.user_id)
                }
            }
            return {
                "message": "Awards Prize successfully !!!",
                "data":  {}
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException("Lỗi trong quá trình trao giải.", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
