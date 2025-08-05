import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PurchaseRepository } from './purchase.reponsitory';
import * as path from 'path'
import { google } from 'googleapis'
import * as iap from 'in-app-purchase';
import axios, { AxiosRequestConfig } from 'axios';
import { Like, MoreThan, Not, Raw } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { VerifyGoogle, VerifyIos } from './dtos/purchase.dto';
import { Response } from "express"
import { IPurchase } from './interfaces/purchase.interface';
import { ProductTypeEnum } from './enum/product-type.enum';
import { ScoringService } from '../scoring/scoring.service';
const fileName = 'src/config/verified/google/api-5471876505635454505-5249-ae6fd8d08044.json'
const projectPath = process.cwd()
const filePath = path.resolve(projectPath, fileName)
const PACKAGE_NAME = "com.eup.migiihsk"
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
const MIA_TEST = 'uploads/mia/user-test.json'
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs'
import { MigiiHSKProductIdEnum } from './enum/product-id.enum';
import * as Sentry from "@sentry/node";
import { BankingActiceDataDto, CreateVirtualBillDto } from './dtos/banking-active.dto';
import { sendTelegramNotification } from '../../../config/notice/index';
const PURCHARSE_MIA_DETAIL = {
    "mia_token": 200,
    "mia_1month": 250,
    "mia_3months": 250,
    "mia_3month": 250,
    "mia_12months": 300,
    "mia_12month": 300,
    "mia_1year": 300,
    "mia_lifetime": 400
}

@Injectable()
export class PurchaseService {
    constructor(
        private readonly purchaseRepository: PurchaseRepository, 
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
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
    
    // Hàm để lấy giá trị dựa trên key
    getPurchaseValue(product_id) {
        const MigiiHSKPurchase = {
            migii_hsk_lifetime_auto: 550000,
            
            migii_hsk_12months_auto: 177000,
            migiihsk_12months_auto: 176000,

            migii_hsk_6months_auto: 248000,
            
            migii_hsk_3months_auto: 156000,            
            migiihsk_3months_auto: 156000,
            
            // MIA AI
            migii_hsk_mia_lifetime: 878000,
            migii_hsk_mia_12months: 349000,
            migii_hsk_mia_3months: 348000,
            migii_hsk_mia_token: 150000,
        };
        
        for (const key in MigiiHSKPurchase) {
            if (product_id.includes(key)) {
                return MigiiHSKPurchase[key];
            }
        }
        return null;
    }

    formatProductIdOfMigiiHSK(product_id) {
        const mappings = {
            "hsk_1month": MigiiHSKProductIdEnum.MIGII_HSK_1MONTH,
            "hsk_3months": MigiiHSKProductIdEnum.MIGII_HSK_3MONTHS,
            "hsk_6months": MigiiHSKProductIdEnum.MIGII_HSK_6MONTHS,
            "hsk_12months": MigiiHSKProductIdEnum.MIGII_HSK_12MONTHS,
            "hsk_lifetime": MigiiHSKProductIdEnum.MIGII_HSK_LIFETIME,
            "hsk_mia_lifetime": MigiiHSKProductIdEnum.MIGII_HSK_MIA_LIFETIME,
            "hsk_mia_12months": MigiiHSKProductIdEnum.MIGII_HSK_MIA_12MONTHS,
            "hsk_mia_3months": MigiiHSKProductIdEnum.MIGII_HSK_MIA_3MONTHS,
            "hsk_mia_1month": MigiiHSKProductIdEnum.MIGII_HSK_MIA_1MONTH,
            "hsk_mia_token": MigiiHSKProductIdEnum.MIGII_HSK_MIA_TOKEN
        };
        
        for (const key in mappings) {
            if (product_id.includes(key)) {
                return mappings[key];
            }
        }
        return null;
    }

    getHighestPriority(input: any, priorityMap: any) {
        let highestPriorityItem = null;
        let highestPriorityIndex = Infinity;
      
        input.forEach(item => {
          if (priorityMap.hasOwnProperty(item)) {
            const currentIndex = priorityMap[item];
            if (currentIndex < highestPriorityIndex) {
              highestPriorityIndex = currentIndex;
              highestPriorityItem = item;
            }
          }
        });
      
        return highestPriorityItem;
      }

    async verifiedGoogleStore(user_id: string, access_token: string, verifyGoogle: VerifyGoogle, res: Response) {
        try {
            const { subscriptionId, token, affiliate } = verifyGoogle
            let affiliate_code: string | null;
            let affiliate_package_key: string | null;
            let affiliate_discount: number | null;
            if (affiliate){
                affiliate_code = affiliate.code || null;
                affiliate_package_key = affiliate.package_key || null;
                affiliate_discount = affiliate.discount || null;
            }
            const platform = "android"
            let input_log: any = {
                user_id: user_id,
                transaction_id: token,
                platforms: platform,
                product_id_sale: subscriptionId,
                access_token: access_token,
                affiliate_code: affiliate_code,
                affiliate_package_key: affiliate_package_key,
                affiliate_discount: affiliate_discount
            }
            if(!user_id){
                input_log.status_code = HttpStatus.UNAUTHORIZED
                this.addPurchaseUserLog(input_log)
                throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED)
            }
            try {
                const result: any = await this.verifiedGoogleStoreHelper(subscriptionId, token)
                if (!subscriptionId.includes("forever") && !subscriptionId.includes("lifetime") && !result.data.paymentState){
                    input_log.status_code = HttpStatus.PAYMENT_REQUIRED
                    this.addPurchaseUserLog(input_log)
                    return res.status(HttpStatus.PAYMENT_REQUIRED).json({
                        "statusCode": HttpStatus.PAYMENT_REQUIRED,
                        "message": "paymentState"
                    })
                }
                const resultClear = {
                    data: {
                        orderId: result.data.orderId,
                        packageName: PACKAGE_NAME,
                        productId: subscriptionId,
                        purchaseTime: result.data.startTimeMillis,
                        purchaseState: 0,
                        purchaseToken: token,
                        quantity: "",
                        autoRenewing: "",
                        acknowledged: "",
                    },
                    signature: "",
                }
                try {
                    const timestampCurrent = Date.now()
                    const premiumUserCurrentRaw = await this.getPremiumCurrent(+user_id, timestampCurrent)
                    const timeUseAgain = premiumUserCurrentRaw.length && premiumUserCurrentRaw[0].time_expired - timestampCurrent > 0 ? premiumUserCurrentRaw[0].time_expired - timestampCurrent : 0
                    const purchase_date = result.data.startTimeMillis
                    const time_expired = +result.data.expiryTimeMillis + timeUseAgain
                    let product_id = subscriptionId
                    let mia_total = 0
                    let product_type = 1
                    for(const key in PURCHARSE_MIA_DETAIL) {
                        if(subscriptionId.includes(key)) {
                            mia_total = PURCHARSE_MIA_DETAIL[key]
                            product_type = 2
                        }
                    }
                    let input = {
                        user_id: user_id,
                        transaction_id: token,
                        product_id: this.formatProductIdOfMigiiHSK(product_id),
                        platforms: platform,
                        purchase_date,
                        time_expired,
                        appStoreReceipt: JSON.stringify(resultClear),
                        product_id_sale: subscriptionId,
                        mia_total: mia_total,
                        product_type: product_type,
                        affiliate_code: affiliate_code,
                        affiliate_package_key: affiliate_package_key,
                        affiliate_discount: affiliate_discount
                    }
                    let addPremium = await this.addPurchaseUser(input)
                    if (addPremium){
                        input_log.status_code = 200
                        this.addPurchaseUserLog(input_log)
                        return res.status(200).json(addPremium)
                    }
                    else{
                        input_log.status_code = HttpStatus.CONFLICT
                        this.addPurchaseUserLog(input_log)
                        return res.status(HttpStatus.CONFLICT).json({ message: 'Token has been synchronized' })
                    }
                } catch (e) {
                    input_log.status_code = HttpStatus.BAD_REQUEST
                    this.addPurchaseUserLog(input_log)
                    throw new HttpException('Verify failed 1', HttpStatus.BAD_REQUEST)
                }
            } catch (err) {
                input_log.status_code = HttpStatus.BAD_REQUEST
                this.addPurchaseUserLog(input_log)
                throw new HttpException('Verify failed 2', HttpStatus.BAD_REQUEST)
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async verifiedAppleStore(user_id: string, access_token: string, verifyIos: VerifyIos, res: Response) {
        try {
            const { receipt, type, affiliate } = verifyIos
            let affiliate_code: string | null;
            let affiliate_package_key: string | null;
            let affiliate_discount: number | null;
            if (affiliate){
                affiliate_code = affiliate.code || null;
                affiliate_package_key = affiliate.package_key || null;
                affiliate_discount = affiliate.discount || null;
            }
            let platform = "ios"
            if (type == "sandbox"){
                platform = "ios-sandbox"
            }

            let input_log: any = {
                user_id: user_id,
                transaction_id: receipt,
                platforms: platform,
                product_id_sale: "",
                access_token: access_token,
                affiliate_code: affiliate_code,
                affiliate_package_key: affiliate_package_key,
                affiliate_discount: affiliate_discount
            }
            
            if(!user_id){
                input_log.status_code = HttpStatus.UNAUTHORIZED
                this.addPurchaseUserLog(input_log)
                throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED)
            }
            try {
                const result: any = await this.verifiedAppleStoreHelper(receipt, type)            
                try {
                    const timestampCurrent = Date.now()
                    const premiumUserCurrentRaw = await this.getPremiumCurrent(+user_id, timestampCurrent)
                    const timeUseAgain = premiumUserCurrentRaw.length && premiumUserCurrentRaw[0].time_expired - timestampCurrent > 0 ? premiumUserCurrentRaw[0].time_expired - timestampCurrent : 0
                    const latest_receipt_info = result.data.latest_receipt_info
                    if(!latest_receipt_info && !Array.isArray(latest_receipt_info) && !latest_receipt_info.length) {
                        input_log.status_code = HttpStatus.BAD_REQUEST
                        this.addPurchaseUserLog(input_log)
                        throw new HttpException('Verify failed', HttpStatus.BAD_REQUEST)
                    }
                    const purchase_date = result.data.startTimeMillis
                    const time_expired = +result.data.expiryTimeMillis + timeUseAgain
                    let subscriptionId = result.data.latest_receipt_info[0].product_id
                    let product_id = subscriptionId
                    var receipt_orderId = result.data.latest_receipt_info[0]["transaction_id"];
                    let mia_total = 0
                    let product_type = 1
                    for(const key in PURCHARSE_MIA_DETAIL) {
                        if(subscriptionId.includes(key)) {
                            mia_total = PURCHARSE_MIA_DETAIL[key]
                            product_type = 2
                        }
                    }
                    
                    let input = {
                        user_id: user_id,
                        transaction_id: receipt_orderId,
                        product_id: this.formatProductIdOfMigiiHSK(product_id),
                        platforms: platform,
                        purchase_date,
                        time_expired,
                        appStoreReceipt: JSON.stringify(result.data),
                        product_id_sale: subscriptionId,
                        mia_total: mia_total,
                        product_type: product_type,
                        affiliate_code: affiliate_code,
                        affiliate_package_key: affiliate_package_key,
                        affiliate_discount: affiliate_discount
                    }
                    let addPremium = await this.addPurchaseUser(input)
                    
                    if (addPremium){
                        input_log.status_code = 200
                        this.addPurchaseUserLog(input_log)
                        return res.status(200).json(addPremium)
                    }
                    else{
                        input_log.status_code = HttpStatus.CONFLICT
                        this.addPurchaseUserLog(input_log)
                        return res.status(HttpStatus.CONFLICT).json({ message: 'Token has been synchronized' })
                    }
                } catch (e) {
                    input_log.status_code = HttpStatus.BAD_REQUEST
                    this.addPurchaseUserLog(input_log)
                    throw new HttpException('Verify failed 1', HttpStatus.BAD_REQUEST)
                }
            } catch (err) {
                input_log.status_code = HttpStatus.BAD_REQUEST
                this.addPurchaseUserLog(input_log)
                throw new HttpException('Verify failed 2', HttpStatus.BAD_REQUEST)
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async getPurchaseByUserIdMia(userId: number) {
        try {
            let premiumUseMia = await this.purchaseRepository.findOne({
                where: {
                    idUser: userId,
                    active: 1,
                    productType: ProductTypeEnum.PRODUCT_TYPE_MIA,
                    productId: Raw(alias => `${alias} NOT LIKE '%mia_token%' AND ${alias} NOT LIKE '%mia_custom%'`),
                },
                order: {
                    id: 'DESC'
                },
                select: ['id', 'purchaseDate', 'timeExpired', 'productId', "miaTotal"]
            })
            if(!premiumUseMia) {
                premiumUseMia = await this.purchaseRepository.findOne({
                    where: {
                        idUser: userId,
                        active: 1,
                        productType: ProductTypeEnum.PRODUCT_TYPE_MIA,
                        productId: Not(Like('%mia_custom%'))
                    },
                    order: {
                        id: 'DESC'
                    },
                    select: ['id', 'purchaseDate', 'timeExpired', 'productId', "miaTotal"]
                })
            }
            return premiumUseMia
        } catch (error) {
            Sentry.captureException(error);
        }
    }

    async getAllPurchaseByUserIdMiaToken(userId: number) {
        try {
            const premiumUseMia = await this.purchaseRepository.findAll({
                where: {
                    idUser: userId,
                    active: 1,
                    productType: ProductTypeEnum.PRODUCT_TYPE_MIA,
                    productId: Like(`%mia_token%`)
                },
                order: {
                    id: 'DESC'
                },
                select: ['id', 'purchaseDate', 'timeExpired', 'productId', "miaTotal"]
            })
            return premiumUseMia
        } catch (error) {
            Sentry.captureException(error);
        }
    }

    async getAllPurchaseByUserIdMiaCustom(userId: number) {
        try {
            const premiumUseMia = await this.purchaseRepository.findAll({
                where: {
                    idUser: userId,
                    active: 1,
                    productType: ProductTypeEnum.PRODUCT_TYPE_MIA,
                    productId: Like(`%mia_custom%`)
                },
                order: {
                    id: 'DESC'
                },
                select: ['id', 'purchaseDate', 'timeExpired', 'productId', "miaTotal"]
            })
            return premiumUseMia
        } catch (error) {
            Sentry.captureException(error);
        }
    }

    async getPremiumCurrent(userId: number, timestampCurrent: number) {
        const premiumUserCurrentRaw = await this.purchaseRepository.query(`SELECT purchase_date, time_expired, product_id, product_type FROM purchase WHERE id_user = ? AND active = 1 AND time_expired > ? ORDER BY time_expired DESC LIMIT 1`, [userId, timestampCurrent])
        return premiumUserCurrentRaw
    }
    
    async getPurchaseByUserId(userId: number){
        const timestampCurrent = Date.now()
        const NOT_MIA_PREMIUM_PACKAGE = ["migii_hsk_mia_custom", "migii_hsk_mia_token"]
        const premiumUserCurrentRaw = await this.purchaseRepository.query(`SELECT purchase_date, time_expired, product_id, product_type FROM purchase WHERE id_user = ? AND active = 1 AND time_expired > ? ORDER BY time_expired DESC LIMIT 1`, [userId, timestampCurrent])

        const checkLifetimePremium = await this.purchaseRepository.query(`SELECT purchase_date, time_expired, product_id, product_type FROM purchase WHERE id_user = ? AND active = 1 AND time_expired > ? AND product_id != "migii_hsk_mia_token" ORDER BY CASE
                WHEN product_id LIKE '%lifetime%' OR product_id LIKE '%forever%' THEN 0
                ELSE 1
            END,
            time_expired DESC LIMIT 1`, [userId, timestampCurrent])
        const totalTokenMIAUserCurrentRaw = await this.purchaseRepository.query(`SELECT sum(mia_total) as mia_total FROM purchase WHERE id_user = ? AND active = 1`, [userId])

        // Case 1:
        if(!premiumUserCurrentRaw.length && !+totalTokenMIAUserCurrentRaw[0].mia_total) return []

        // Case 2:
        if(premiumUserCurrentRaw.length && !NOT_MIA_PREMIUM_PACKAGE.includes(premiumUserCurrentRaw[0].product_id) && premiumUserCurrentRaw[0].product_type == ProductTypeEnum.PRODUCT_TYPE_MIA) {
            const premiumsExtra = [
                {
                    "product_type": ProductTypeEnum.PRODUCT_TYPE_MIA,
                    "is_premium": true,
                    "product_id": premiumUserCurrentRaw[0].product_id,
                    "purchase_date": +premiumUserCurrentRaw[0].purchase_date,
                    "time_expired": +premiumUserCurrentRaw[0].time_expired,
                    "mia_total": +totalTokenMIAUserCurrentRaw[0].mia_total
                }
            ]
            return premiumsExtra
        }

        const checkIsPremiumUser = premiumUserCurrentRaw.length ? true : false
        // Case 3:
        const premiumsExtra = [
            {
                "product_type": ProductTypeEnum.PRODUCT_TYPE_STANDARD,
                "is_premium": checkIsPremiumUser,
                "product_id": checkLifetimePremium.length ? checkLifetimePremium[0].product_id : NOT_MIA_PREMIUM_PACKAGE[0],
                "purchase_date": premiumUserCurrentRaw.length ? +premiumUserCurrentRaw[0].purchase_date : 0,
                "time_expired": premiumUserCurrentRaw.length ? +premiumUserCurrentRaw[0].time_expired : 0,
                "mia_total": 0
            },
            {
                "product_type": ProductTypeEnum.PRODUCT_TYPE_MIA,
                "is_premium": false,
                "product_id": NOT_MIA_PREMIUM_PACKAGE[1],
                "purchase_date": 0,
                "time_expired": 0,
                "mia_total": +totalTokenMIAUserCurrentRaw[0].mia_total
            }
        ]
        return premiumsExtra
    }

    async getPurchaseByUserId_New(userId: number) {
        const priorityDataMia = [
            'migii_hsk_mia_lifetime', 'migii_hsk_mia_12months', 'migii_hsk_mia_3months', 'migii_hsk_mia_1months',
            'migii_hsk_mia_token', 'migii_hsk_mia_custom'
        ]

        const priorityDataPre = [
            'preforevermonths', 'migii_hsk_lifetime_auto_sale50', 'preforevermonths_event',
            'pre12months', 'migii_hsk_12months_auto_sale70', 'migii_hsk_12months_auto_sale60', 
            'pre12months_event', 'pre6months', 'pre3months',
            'pre3months_event', 'pre1months', 'pre1months_event',
            'pre15days', 'pre10days', 'pre7days',
            'pre5days', 'pre5days_event'
        ]

        const productMap = {
            migii_hsk_mia_lifetime: ["migii_hsk_mia_lifetime"],
            migii_hsk_mia_12months: ["migii_hsk_mia_12months"],
            migii_hsk_mia_3months: ["migii_hsk_mia_3months"],
            migii_hsk_mia_1months: ["migii_hsk_mia_1months"],
            migii_hsk_mia_token: ["migii_hsk_mia_token"],
            migii_hsk_mia_custom: ["migii_hsk_mia_custom", "preforevermonths_event", "pre12months_event", "pre3months_event", "pre1months_event", "pre15days", "pre10days", "pre7days", "pre5days", "pre5days_event"],
            preforevermonths: ["preforevermonths", "migii_hsk_lifetime_auto_sale50"],
            pre12months: ["pre12months", "migii_hsk_12months_auto_sale70", "migii_hsk_12months_auto_sale60"],
            pre6months: ["pre6months"],
            pre3months: ["pre3months"],
            pre1months: ["pre1months"],
        }

        const timestampCurrent = Date.now()
        const premiumUserCurrentRaw = await this.getPremiumCurrent(userId, timestampCurrent)

        const checkIsRealHasMiaToken = await this.purchaseRepository.query(`SELECT * FROM admin_hsk.purchase WHERE id_user = ? AND active = 1 AND product_type = 2 AND (time_expired = purchase_date OR mia_total > 0 OR origin_mia_total > 0 OR product_id not like "%custom%")`, [userId])
        const totalTokenMIAUserCurrentRaw = await this.purchaseRepository.query(`SELECT sum(mia_total) as mia_total FROM purchase WHERE id_user = ? AND active = 1`, [userId])

        const allProductExist = await this.purchaseRepository.query(`SELECT product_id, product_type FROM admin_hsk.purchase WHERE id_user = ? AND active = 1 GROUP BY product_id, product_type`, [userId])
        const allProductPre = allProductExist.filter(ele => ele.product_type == 1).map(ele => ele.product_id)
        const allProductMia = allProductExist.filter(ele => ele.product_type == 2).map(ele => ele.product_id)

        const priorityMapPre = priorityDataPre.reduce((map, item, index) => {
            map[item] = index;
            return map;
          }, {})
          const priorityMapMia = priorityDataMia.reduce((map, item, index) => {
            map[item] = index;
            return map;
          }, {})

        const highestPriorityPre = this.getHighestPriority(allProductPre, priorityMapPre);
        const highestPriorityMia = this.getHighestPriority(allProductMia, priorityMapMia);        


        const checkIsPremiumUser = premiumUserCurrentRaw.length ? true : false
        const premiumMiaUserExtra = {
            is_premium: checkIsPremiumUser,
            time_expired: premiumUserCurrentRaw.length ? +premiumUserCurrentRaw[0].time_expired : null,
            mia_total : checkIsRealHasMiaToken ? +totalTokenMIAUserCurrentRaw[0].mia_total : null,
            product_id : {
                pre : highestPriorityPre ? Object.keys(productMap).find(key => productMap[key].includes(highestPriorityPre)): null,
                mia: highestPriorityMia ? Object.keys(productMap).find(key => productMap[key].includes(highestPriorityMia)) : null
            },
        }

        if (!highestPriorityPre && highestPriorityMia == "migii_hsk_mia_custom") {
            const allPurchaseMiaCustom = await this.purchaseRepository.query(`SELECT product_id, purchase_date, time_expired, mia_total, origin_mia_total FROM admin_hsk.purchase WHERE id_user = ? AND active = 1 AND product_id = "migii_hsk_mia_custom"`, [userId])
            const checkPackageCustomNotMia = allPurchaseMiaCustom.every(obj => +obj.mia_total > 0 || +obj.origin_mia_total > 0);
            const checkPackageCustomMixed = allPurchaseMiaCustom.every(obj => (+obj.mia_total > 0 || +obj.origin_mia_total > 0) && (+obj.time_expired > +obj.purchase_date));

            if (checkPackageCustomNotMia) {
                premiumMiaUserExtra.product_id.pre = highestPriorityMia
                premiumMiaUserExtra.product_id.mia = null
            }else if(checkPackageCustomMixed) {
                premiumMiaUserExtra.product_id.pre = highestPriorityMia
            }
        }

        if (!highestPriorityPre && ['migii_hsk_mia_lifetime', 'migii_hsk_mia_12months', 'migii_hsk_mia_3months'].includes(highestPriorityMia)) {
            premiumMiaUserExtra.product_id.pre = highestPriorityMia
        }
            
        if(!premiumMiaUserExtra.is_premium && !premiumMiaUserExtra.mia_total) {
            return null
        }

        return premiumMiaUserExtra
    }
    async verifiedGoogleStoreHelper(subscriptionId: string, token: string){
        const auth = new google.auth.GoogleAuth({
            keyFile: filePath,
            scopes: ['https://www.googleapis.com/auth/androidpublisher']
        })
        const androidpublisher = google.androidpublisher({ version: 'v3', auth })
        iap.config({
            googlePublicKeyStrLive: this.configService.get<string>(
                'app.googlePlayPublicKey',
              ),
            test: false,
            verbose: false
        })
        if (!subscriptionId.includes("forever") && !subscriptionId.includes("lifetime")) {
            const results: any = await androidpublisher.purchases.subscriptions.get({
                packageName: PACKAGE_NAME,
                subscriptionId: subscriptionId,
                token: token
            })
            try {
                results.data.startTimeMillis = parseInt(results.data.startTimeMillis)
                results.data.expiryTimeMillis = parseInt(results.data.expiryTimeMillis)
            } catch {
                results.data.startTimeMillis = 0
                results.data.expiryTimeMillis = 0
            }
            return results
        } else {
            const results: any = await androidpublisher.purchases.products.get({
                packageName: PACKAGE_NAME,
                productId: subscriptionId,
                token: token
            })
            try {
                results.data.startTimeMillis = parseInt(results.data.purchaseTimeMillis)
                results.data.expiryTimeMillis = results.data.startTimeMillis + 307584000000
            } catch {
                results.data.startTimeMillis = 0
                results.data.expiryTimeMillis = 0
            }
            return results
        }
        
    }

    async verifiedAppleStoreHelper(receipt: string, type: string = '') {
        let url: string
        if (type == 'sandbox') {
            url = "https://sandbox.itunes.apple.com/verifyReceipt"
        } else {
            url = "https://buy.itunes.apple.com/verifyReceipt"
        }
        
        const options: AxiosRequestConfig = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            url: url,
            data: {
                "receipt-data": receipt,
                "password": this.configService.get<string>(
                    'app.appStorePass',
                ),
                "exclude-old-transactions": true
            }
        }
        const results = await axios(options)
        try {
            if (results.data.latest_receipt_info[0]["cancellation_date"]){
                results.data.startTimeMillis = 0
                results.data.expiryTimeMillis = 0 
            } else {
                results.data.startTimeMillis = parseInt(results.data.latest_receipt_info[0].purchase_date_ms)
                results.data.expiryTimeMillis = results.data.latest_receipt_info[0].expires_date_ms;
                if (!results.data.expiryTimeMillis){
                    results.data.expiryTimeMillis = results.data.startTimeMillis + 307584000000;
                }
                results.data.expiryTimeMillis = parseInt(results.data.expiryTimeMillis)
            }
        } catch (e) {
            results.data.startTimeMillis = 0
            results.data.expiryTimeMillis = 0
        }
        return results
    }

    async addPurchaseUserLog(input: any){
        const { user_id, product_id_sale, transaction_id, platforms, status_code, access_token, affiliate_code, affiliate_package_key, affiliate_discount} = input
        try {
            this.purchaseRepository.query(`insert into purchase_order_log set user_id = ?, product_id_sale = ?, transaction_id = ?, 
            platforms = ?, status_code = ?, access_token = ?, affiliate_code = ?, affiliate_package_key = ?, affiliate_discount = ?
            `, [user_id, product_id_sale, transaction_id, platforms, status_code, access_token, affiliate_code, affiliate_package_key, affiliate_discount])
        } catch (error) {
        }
        return null
    }

    async addPurchaseUser(input: any){
        let checkPremium: any = await this.purchaseRepository.query("select id, id_user, transaction_id, time_expired from purchase WHERE transaction_id = ? order by id desc limit 1", [input.transaction_id])
        const newPurchase: IPurchase = {
            idUser: input.user_id,
            productId: input.product_id,
            platforms: input.platforms,
            purchaseDate: input.purchase_date,
            timeExpired: input.time_expired,
            appStoreReceipt: input.appStoreReceipt,
            transactionId: input.transaction_id,
            productIdSale: input.product_id_sale,
            miaTotal: input.mia_total,
            productType: input.product_type,
            affiliateCode: input.affiliate_code,
            affiliatePackageKey: input.affiliate_package_key,
            affiliateDiscount: input.affiliate_discount,
            originMiaTotal: input.mia_total
        }
        const response = {
            premium:{
                purchase_date: input.purchase_date, 
                time_expired: input.time_expired, 
                product_id: input.product_id
            }
        }
        if (!checkPremium.length){
            let premium = await this.purchaseRepository.create(newPurchase)
            const message = `🚀🚀🚀 Thông báo thanh toán IAP:\n➕ Dự án: MIGII HSK\n➕ Thời gian:${input.purchase_date}\n➕ Gói bán: ${input.product_id_sale}\n➕ Số tiền: $\n➕ Nội dung giao dịch: ${input.transaction_id}\n➕ Đến từ: ${input.platforms}`
            await sendTelegramNotification(`✅✅✅ GIAO DỊCH THÀNH CÔNG !!! 🎉🎉🎉\n${message}`, "IAP")
            return response
        }else{
            if (checkPremium[0].time_expired.toString() != input.time_expired.toString()){
                await this.purchaseRepository.update(+checkPremium[0].id, {
                    timeExpired: input.time_expired,
                })
                return response
            }
        }
        return null
    }

    async updateOption(id: number, miaTotal: number) {
        return await this.purchaseRepository.update(id, {miaTotal})
    }

    async craeteNewPurchaseCustomMia(data) {
        return await this.purchaseRepository.create(data)
    }

    async findByNote(data) {
        return await this.purchaseRepository.findByCondition(data)
    }

    async getAffiliateOrder(input: any){
        try {
            const response: any = await this.purchaseRepository.query(`select purchase.id_user as user_id, purchase.product_id_sale as package, 
                                            purchase.purchase_date as order_date_ms,
                                            purchase.affiliate_code as code, purchase.affiliate_package_key as package_key,
                                            purchase.affiliate_discount as discount,
                                            purchase.platforms as payment_platform,
                                            purchase.platform_pred as user_platform,
                                            users.email, users.name as user_name,users.language, users.country,
                                            (purchase.exchange * purchase.price_sale) as price_sale
                                            from purchase
                                            inner join users on users.id = purchase.id_user
                                            where CONVERT(purchase_date, UNSIGNED) >= ?
                                            and CONVERT(purchase_date, UNSIGNED) <= ?
                                            and (purchase.affiliate_code is not NULL and purchase.affiliate_code != '')
                `, [input.start_time, input.end_time])
            const output: any[] = [];
            for (let i = 0; i < response.length; i++){
                try {
                    response[i]["order_date_ms"] = parseInt(response[i]["order_date_ms"])
                    if(response[i]["payment_platform"] && response[i]["payment_platform"].toLowerCase().includes("ios")){
                        response[i]["payment_platform"] = "apple"
                        response[i]["user_platform"] = "ios"
                    }else if(response[i]["payment_platform"] && response[i]["payment_platform"].toLowerCase().includes("android")){
                        response[i]["payment_platform"] = "google"
                        response[i]["user_platform"] = "android"
                    }else{
                        response[i]["payment_platform"] = "transfer"
                        if (response[i]["user_platform"] && response[i]["user_platform"].toLowerCase().includes("ios")){
                            response[i]["user_platform"] = "ios"
                        }else if(response[i]["user_platform"] && response[i]["user_platform"].toLowerCase().includes("android")){
                            response[i]["user_platform"] = "android"
                        }else{
                            response[i]["user_platform"] = null
                        }
                    }
                    output.push(response[i])
                } catch (error) {
                    console.log(error)
                }
            }
            return output
        } catch (error) {
            console.log(error)
        }
        return null
    }

    getTimePremiumDetail(purchaseDetail) {
        if (purchaseDetail.includes("1month")) {
            return 2678400000;
        } else if (purchaseDetail.includes("3month")) {
            return 8035200000;
        } else if (purchaseDetail.includes("6month")) {
            return 15811200000;
        } else if (purchaseDetail.includes("12month") || purchaseDetail.includes("1year")) {
            return 31622400000;
        } else if (purchaseDetail.includes("preforever") || purchaseDetail.includes("lifetime")) {
            return 3153600000000;
        } else {
            return 0;
        }
    }

    decodeJWT(token: string): any {
        try {
          const decoded = jwt.decode(token);
          return decoded;
        } catch (error) {
          console.error('Invalid token:', error);
          return null;
        }
    }

    formatProductIdMiaCountOfMigiiHSK(productId) {
        const mapping = {
            "migii_hsk_mia_lifetime": 400,
            "migii_hsk_mia_12months": 300,
            "migii_hsk_mia_3months": 250,
            "migii_hsk_mia_1month": 250,
            "migii_hsk_mia_token": 200
        };
    
        for (const key in mapping) {
            if (productId.startsWith(key)) {
                return mapping[key];
            }
        }
    
        return 0;
    }

    isNumber(str) {
        return !isNaN(parseFloat(str)) && isFinite(str);
    }

    async bankingActivePremium(bankingActiceDataDto: BankingActiceDataDto) {
        const {virtual_bill, transaction} = bankingActiceDataDto
        const message = `🚀🚀🚀 Thông báo ngân hàng ACB (${transaction.accountNumber}):\n➕ Dự án: MIGII HSK\n➕ Thời gian:${transaction.transactionDate}\n➕ Gói bán: ${virtual_bill.product_id}\n➕ Số tiền: ${transaction.amount}\n➕ Nội dung giao dịch: ${transaction.transactionContent}\n➕ Tài khoản nguồn: ${transaction.transactionEntityAttribute.receiverBankName} - ${transaction.transactionEntityAttribute.issuerBankName} - ${transaction.transactionEntityAttribute.remitterName} - ${transaction.transactionEntityAttribute.remitterAccountNumber}`
        try {
            const checkExistPurchase = await this.purchaseRepository.query(
                `select * from purchase WHERE note = ? limit 1`,
                [virtual_bill.transaction_code],
            );
            if (checkExistPurchase.length) {
                await sendTelegramNotification(`❌❌❌ GIAO DỊCH THẤT BẠI - ĐƠN ĐÃ ĐƯỢC XỬ LÝ TRƯỚC ĐÓ !!! 😞😞😞\n${message}`)
                throw new HttpException(
                    "Đơn đã được thanh toán",
                    HttpStatus.BAD_REQUEST,
                );
            }
            const PRICE_DIFFERENCE = 10000
            if (+virtual_bill.price > +transaction.amount + PRICE_DIFFERENCE || +this.getPurchaseValue(virtual_bill.product_id) > +transaction.amount + PRICE_DIFFERENCE) {
                await sendTelegramNotification(`❌❌❌ GIAO DỊCH THẤT BẠI - GIÁ TRỊ ĐƠN KHÔNG HỢP LỆ !!! 😞😞😞\n${message}`)
                throw new HttpException(
                    "Đơn không hợp lệ",
                    HttpStatus.BAD_REQUEST,
                );
            }

            const STANDARD_PRUCTION = 1
            const MIA_PRODUCTION = 2
            
            const {affiliate} = virtual_bill
            const currentTime = Date.now()
            const timeProductDetail = this.getTimePremiumDetail(virtual_bill.product_id)
            const findPremiumCurrent = await this.getPurchaseByUserId_New(+virtual_bill.user_id)
            const remainingTimeUser = findPremiumCurrent && findPremiumCurrent.is_premium && findPremiumCurrent.time_expired ? +(findPremiumCurrent.time_expired - currentTime) : 0

            const deviceCurrentFromUser = await this.purchaseRepository.query(`select platforms from users_device_manager WHERE user_id = ? order by created_at desc limit 1`, [+virtual_bill.user_id])

            const dataJWTDecode = this.decodeJWT(virtual_bill.id)
            const transactionChannel = dataJWTDecode.data.split(".")[6]
            const miaTotal = this.formatProductIdMiaCountOfMigiiHSK(virtual_bill.product_id)
            const productType = miaTotal ? MIA_PRODUCTION : STANDARD_PRUCTION
            const newPurchase = {
                idUser: +virtual_bill.user_id,
                productId: this.formatProductIdOfMigiiHSK(virtual_bill.product_id),
                platforms: "web",
                purchaseDate: +currentTime,
                timeExpired: +currentTime + timeProductDetail + remainingTimeUser,
                appStoreReceipt: JSON.stringify(bankingActiceDataDto),
                note: virtual_bill.transaction_code,
                country: "VN",
                exchange: 1,
                adminId: 0,
                priceSale: +transaction.amount,
                platformPred: deviceCurrentFromUser[0]?.platforms.toLowerCase(),
                miaTotal: +miaTotal,
                productType: productType,
                affiliateCode: affiliate && affiliate?.affiliate_code ? affiliate?.affiliate_code : null,
                affiliatePackageKey: affiliate && affiliate?.affiliate_package_key ? affiliate?.affiliate_package_key : null,
                affiliateDiscount: affiliate && affiliate?.affiliate_discount && this.isNumber(affiliate?.affiliate_discount) ? +affiliate?.affiliate_discount : null,
                bank: 21,
                originMiaTotal: +miaTotal,
                transactionCode: virtual_bill.transaction_code
            }
            
            const createPurchaseCurrent = await this.purchaseRepository.create(newPurchase)
            await sendTelegramNotification(`✅✅✅ GIAO DỊCH THÀNH CÔNG !!! 🎉🎉🎉\n${message}`)
            return {
                data: createPurchaseCurrent,
                message: "Create new purchase by banking active successfully!"
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            else {
                await sendTelegramNotification(`❌❌❌ GIAO DỊCH THẤT BẠI !!! 😞😞😞\n${message}`)
                throw new HttpException(
                    error,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
    }

    async getVirtualBillHSK(user_id: string, createVirtualBillDto: CreateVirtualBillDto) {
        const {product_id, price, affiliate} = createVirtualBillDto
        const URL = 'https://payments.eup.ai/payment/virtual-bill';
        const VIRTRUAL_BILL_TOKEN = '994c5677f5a9476aaa5e13ba9a274f77'
        const data = {
            user_id: user_id.toString(),
            product_id: product_id,
            price: +price,
            project_id: 'MHSK',
            currency: 'VND',
        };
        const affiliateFinal = {}
        if (affiliate) {
            if (affiliate.hasOwnProperty("affiliate_code")) {
                affiliateFinal["affiliate_code"] = affiliate.affiliate_code
            }
            if (affiliate.hasOwnProperty("affiliate_package_key")) {
                affiliateFinal["affiliate_package_key"] = affiliate.affiliate_package_key
            }
            if (affiliate.hasOwnProperty("affiliate_discount")) {
                affiliateFinal["affiliate_discount"] = affiliate.affiliate_discount
            }
            data["affiliate"] = affiliateFinal
        }
        
        const config = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${VIRTRUAL_BILL_TOKEN}`
            },
            maxBodyLength: Infinity,
        };

        try {
            const response: AxiosResponse = await lastValueFrom(
                this.httpService.post(URL, data, config),
            );
            return response.data;
        } catch (error) {
            console.log(error)
            throw new HttpException(
                "Get virtual bill failed !!!",
                HttpStatus.BAD_REQUEST,
            );
        }
    }

}
