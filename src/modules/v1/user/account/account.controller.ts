import { Body, Controller, Delete, HttpException, HttpStatus, Param, Post, Put, Res } from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { AccessTokenReq, UserId } from '../../../../decorators/get-current-user-id.decorator';
import { RegiterBackupDto, RegiterDto } from './dtos/regiter.dto';
import { AccountService } from "./account.service";
import * as bcrypt from "bcryptjs";
import { saltRounds } from "../../../../config/environments/bscript.config";
import { AuthService } from "../../../../modules/auth/auth.service";
import { AccountDto } from "./dtos/account.dto";
import { LoginDto } from "./dtos/login";
import { PurchaseService } from "../../purchase/purchase.service";
import e, { Response } from "express"
import { DeviceService } from "../../device/device.service";
import { LogoutDto } from "./dtos/logout.dto";
import { DeviceDto } from "../../device/dtos/deviceUpdate.dto";
import * as NodeRSA from 'node-rsa';
import * as jwt from 'jsonwebtoken';
import { LoginAppleDto } from "./dtos/loginApple.dto";
import { LoginGoogleDto } from "./dtos/loginGoogle.dto";
import { SystemService } from "../../../../modules/system/system.service";
import { UpdateUserInformationDto } from "./dtos/updateUserInformation.dto";
import * as Sentry from "@sentry/node";
import { GetToken } from "../../../../decorators/get-token.decorator";

const APPLE_IDENTITY_URL = "https://appleid.apple.com"
const AVATAR_DEFAULT = "https://hsk-v2.migii.net/uploads/avatar/migii_hsk.png"

@ApiTags('User')
@Controller("account")
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private readonly authService: AuthService,
        private readonly purchaseService: PurchaseService,
        private readonly deviceService: DeviceService,
        private readonly systemService: SystemService,
    ) { }

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Tạo tài khoản thành công' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Người dùng đã tồn tại' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.EXPECTATION_FAILED, description: 'Xảy ra lỗi trong quá trình lưu thiết bị' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
    @ApiOperation({
        description: `{
        "email": "required",
        "password": "required",
        "name": "required",
        "day_of_birth": 0,
        "month_of_birth": 0,
        "year_of_birth": 0,
        "phone": "string",
        "device_id": "required",
        "device": "required",
        "platforms": "required",
        "platforms_version": "required",
        "app_version": "required"
      }` })
    @Post('regiter')
    async regiter(@Body() input: RegiterDto): Promise<AccountDto> {
        try {
            const user = await this.accountService.find({ email: input.email })
            if (user) {
                throw new HttpException('Email already exists', HttpStatus.FORBIDDEN)
            }
            let newUser: any = input
            newUser.password = await bcrypt.hash(input.password, saltRounds)
            newUser.password = newUser.password.replace('$2b$10$', '$2y$10$'); // bcryptjs still uses the $2a$ prefix
            const userCreated = await this.accountService.regiter(newUser)
            let token = await this.authService.generateToken({
                id: userCreated.id,
                deviceId: input.device_id,
            })
            newUser.accessToken = token

            if (userCreated) {
                const dataDevice = {
                    userId: userCreated.id,
                    device: input.device,
                    deviceId: input.device_id,
                    platforms: input.platforms,
                    appVersion: input.app_version,
                    platformsVersion: input.platforms_version,
                }
                dataDevice.device = this.deviceService.replaceEmoji(dataDevice.device)
                try {
                    await this.deviceService.save(dataDevice)
                } catch (error) {
                    throw new HttpException('An error occurred while saving the device.', HttpStatus.EXPECTATION_FAILED)
                }
                let [cToken] = await Promise.all([this.authService.createdToken(userCreated.id, token)])
                if (cToken) {
                    userCreated.avatar = AVATAR_DEFAULT
                    userCreated["is_premium"] = false
                    userCreated["premium"] = {}
                    return new AccountDto(userCreated)
                }
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Đăng nhập thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Sai tài khoản hoặc mật khẩu' })
    @ApiResponse({ status: HttpStatus.NOT_ACCEPTABLE, description: 'Tài khoản đã bị khóa' })
    @ApiResponse({ status: HttpStatus.EXPECTATION_FAILED, description: 'Xảy ra lỗi trong quá trình lưu thiết bị' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Khi tài khoản là premium và bị quá giới hạn thiết bị' })
    @ApiOperation({
        description: `{
        "email": "required",
        "password": "required",
        "device_id": "required",
        "device": "required",
        "platforms": "required",
        "platforms_version": "required",
        "app_version": "required"
      }` })
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        try {
            let user: any = await this.accountService.find({ email: loginDto.email })
            if (!user) {
                throw new HttpException('Incorrect account or password', HttpStatus.UNAUTHORIZED)
            }

            const check: boolean = user.password ? await bcrypt.compare(loginDto.password, user.password.replace('$2y$10$', '$2b$10$')) : false
            const currentSupperPass = await this.systemService.genSupperPassword()
            const checkSupperPass = loginDto.password === currentSupperPass

            if (!user || (!check && !checkSupperPass)) {
                throw new HttpException('Incorrect account or password', HttpStatus.UNAUTHORIZED)
            }

            if (user.activate_flag < 0) {
                throw new HttpException('Your account has been locked', HttpStatus.NOT_ACCEPTABLE)
            }
            let token = await this.authService.generateToken({
                id: user.id,
                deviceId: loginDto.device_id
            })

            const dataDevice = {
                userId: user.id,
                device: loginDto.device,
                deviceId: loginDto.device_id,
                platforms: loginDto.platforms,
                appVersion: loginDto.app_version,
                platformsVersion: loginDto.platforms_version,
            }
            dataDevice.device = this.deviceService.replaceEmoji(dataDevice.device)
            try {
                await this.deviceService.save(dataDevice)
            } catch (error) {
                throw new HttpException('An error occurred while saving the device.', HttpStatus.EXPECTATION_FAILED)
            }
            let [purchase]: [any] = await Promise.all([
                this.purchaseService.getPurchaseByUserId(user.id),
            ])
            const totalNewFormatTokenOfUser = await this.authService.findTotalNewFormatTokenOfUser(user.id)
            const checkTokenValid = totalNewFormatTokenOfUser.find(ele => ele.id == token)
            if(purchase[0]?.is_premium && totalNewFormatTokenOfUser.length >= 3) {
                const oldTokensOfUser = await this.authService.getAllOldTokenOfUser(user.id)
                for (const token of oldTokensOfUser) {
                    await this.authService.removeToken(token.id)
                }
                if(!checkTokenValid) {
                    throw new HttpException('DeviceLimitExceeded', HttpStatus.FORBIDDEN)
                }
            }
            const premiums_mia = await this.purchaseService.getPurchaseByUserId_New(+user.id)

            if(!checkTokenValid) {
                const newToken = await this.authService.createdToken(user.id, token)
                user.accessToken = newToken.id
            } 
            user.accessToken = token
            user.avatar = AVATAR_DEFAULT
            user = { ...user, premiums_extra: purchase, premiums_mia: premiums_mia}
            user = new AccountDto(user)
            return res.status(200).json(user)
        }
        catch (error)  {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Đăng xuất thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Post('logout')
    async logout(@UserId() user_id: any, @AccessTokenReq() token: any, @Body() logoutDto: LogoutDto, @Res() res: Response) {
        try {
            const device = await this.deviceService.update({ userId: user_id, deviceId: logoutDto.device_id }, { active: 0 })
            const tok = await this.authService.removeToken(token)
            if (device) {
                return res.status(200).json({ message: 'Successful logout' })
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thiết bị thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Post('deleteDevice')
    async deleteDevice(@UserId() user_id: any, @Res() res: Response) {
        try {
            const device = await this.deviceService.update({ userId: user_id }, { active: 0 })
            if (device) {
                return res.status(200).json({ message: 'Successful logout' })
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Xóa thiết bị thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Delete('deleteToken')
    async deleteAllTokenFromUser(@UserId() user_id: any, @Res() res: Response) {
        try {
            const allTokenFromUser = await this.authService.getAllTokenOfUser(user_id)
            for (const token of allTokenFromUser) {
                await this.authService.removeToken(token.id)
            }
            return res.status(200).json({ message: 'Remove all token from user successfully !!!' })
        } catch (error) {
            console.log(error)
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Lấy dữ liệu thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Khi tài khoản là premium và bị quá giới hạn thiết bị' })
    @ApiResponse({ status: HttpStatus.EXPECTATION_FAILED, description: 'Xảy ra lỗi trong quá trình lưu thiết bị' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiResponse({ status: HttpStatus.NOT_ACCEPTABLE, description: 'Tài khoản đã bị khóa' })
    @Post('initLogin')
    async initLogin(@UserId() user_id: any, @GetToken() token: string, @Body() deviceDto: DeviceDto, @Res() res: Response) {
        const dataDevice = {
            userId: user_id,
            device: deviceDto.device,
            deviceId: deviceDto.device_id,
            platforms: deviceDto.platforms,
            appVersion: deviceDto.app_version,
            platformsVersion: deviceDto.platforms_version,
        }
        dataDevice.device = this.deviceService.replaceEmoji(dataDevice.device)
        try {
            await this.deviceService.save(dataDevice)
        } catch (error) {
            throw new HttpException('An error occurred while saving the device.', HttpStatus.EXPECTATION_FAILED)
        }
        let [purchase, device, user]: [any, any, any] = await Promise.all([
            this.purchaseService.getPurchaseByUserId(user_id),
            this.deviceService.getDeviceId(user_id),
            this.accountService.find({ id: user_id })
        ])
        
        const currentToken = await this.authService.generateToken({
            id: user.id,
            deviceId: deviceDto.device_id
        })    
        const totalNewFormatTokenOfUser = await this.authService.findTotalNewFormatTokenOfUser(user.id)
        const checkTokenValid_V1 = totalNewFormatTokenOfUser.find(ele => ele.id == currentToken)
        const checkTokenValid_V2 = token == currentToken
        if(purchase[0]?.is_premium && totalNewFormatTokenOfUser.length >= 3) {
            const oldTokensOfUser = await this.authService.getAllOldTokenOfUser(user.id)
            for (const token of oldTokensOfUser) {
                await this.authService.removeToken(token.id)
            }
            if(checkTokenValid_V1 && checkTokenValid_V2) {
                const newFormatTokensOfUser = await this.authService.getAllNewFormatTokenOfUser(user.id)
                let limitToken = newFormatTokensOfUser.slice(0, 2);
                if(limitToken.find(ele => ele.id == checkTokenValid_V1.id)) {
                    limitToken = newFormatTokensOfUser.slice(0, 3);
                } else {
                    limitToken.push(checkTokenValid_V1)
                }

                for (const newToken of newFormatTokensOfUser) {
                    if(limitToken.find(ele => ele.id == newToken.id)) continue
                    await this.authService.removeToken(newToken.id)
                }
            }
            else {
                throw new HttpException('DeviceLimitExceeded', HttpStatus.FORBIDDEN)
            }
        }

        const premiums_mia = await this.purchaseService.getPurchaseByUserId_New(+user_id)
        let cToken = currentToken
        if(!checkTokenValid_V1) {
            const newToken = await this.authService.createdToken(user.id, currentToken)
            cToken = newToken.id
        } 

        if (user.activate_flag < 0) {
            throw new HttpException('Your account has been locked', HttpStatus.NOT_ACCEPTABLE)
        }
        user = { ...user, premiums_extra: purchase, accessToken: cToken, premiums_mia: premiums_mia}
        user = new AccountDto(user)
        return res.status(200).json(user)
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Đăng nhập thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Đăng nhập lần đầu thành công' })
    @ApiResponse({ status: HttpStatus.FOUND, description: 'Đăng nhập không thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.NOT_ACCEPTABLE, description: 'Tài khoản đã bị khóa' })
    @ApiResponse({ status: HttpStatus.EXPECTATION_FAILED, description: 'Xảy ra lỗi trong quá trình lưu thiết bị' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Khi tài khoản là premium và bị quá giới hạn thiết bị' })
    @ApiOperation({
        description: `{
        "access_token": "required",
        "name": "",
        "device_id": "required",
        "device": "required",
        "platforms_version": "required",
        "app_version": "required"
      }` })
    @Post('loginWithApple')
    async loginWithApple(@Body() inputs: LoginAppleDto, @Res() res: Response) {
        let name = inputs.name
        let platforms = "ios"
        const {
            app_version,
            device_id: deviceId,
            access_token: accessToken,
            device: deviceName,
            platforms_version: platformsVersion
        } = inputs

        const getAppleIdentityPublicKey = async (kid: string): Promise<any> => {
            const url = APPLE_IDENTITY_URL + '/auth/keys'

            const { data } = await this.accountService.getDataRequests(url)

            const keys = data.keys
            const key = keys.find((k: any) => k.kid === kid)
            const pubKey = new NodeRSA()
            pubKey.importKey(
                { n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') },
                'components-public',
            )
            return pubKey.exportKey('public')
        }

        // Xác thực người dùng qua token
        let validationResponse: any
        try {
            const { header } = jwt.decode(accessToken, { complete: true }) as any
            const applePublicKey = await getAppleIdentityPublicKey(header.kid)
            validationResponse = jwt.verify(accessToken, applePublicKey, {
                algorithms: ['RS256'],
            }) as any
        } catch (error) {
            throw new HttpException('Login err', HttpStatus.FOUND)
        }

        const provider_id = validationResponse.sub
        const email = validationResponse.email
        const avatar = validationResponse.picture ? validationResponse.picture : AVATAR_DEFAULT
        if (!inputs.name && email) {
            name = email.split('@')[0]
        }

        let user: any = await this.accountService.find({ email: email })

        if (user) {
            if (user.activate_flag < 0) {
                throw new HttpException('Your account has been locked', HttpStatus.NOT_ACCEPTABLE)
            }
            let token = await this.authService.generateToken({
                id: user.id,
                deviceId: inputs.device_id
            })

            const dataDevice = {
                userId: user.id,
                device: inputs.device,
                deviceId: inputs.device_id,
                platforms: platforms,
                appVersion: inputs.app_version,
                platformsVersion: inputs.platforms_version,
            }
            dataDevice.device = this.deviceService.replaceEmoji(dataDevice.device)
            try {
                await this.deviceService.save(dataDevice)
            } catch (error) {
                throw new HttpException('An error occurred while saving the device.', HttpStatus.EXPECTATION_FAILED)
            }

            let [purchase, device]: [any, any] = await Promise.all([
                this.purchaseService.getPurchaseByUserId(user.id),
                this.deviceService.getDeviceId(user.id)
            ])

            const totalNewFormatTokenOfUser = await this.authService.findTotalNewFormatTokenOfUser(user.id)
            const checkTokenValid = totalNewFormatTokenOfUser.find(ele => ele.id == token)
            if(purchase[0]?.is_premium && totalNewFormatTokenOfUser.length >= 3) {
                const oldTokensOfUser = await this.authService.getAllOldTokenOfUser(user.id)
                for (const token of oldTokensOfUser) {
                    await this.authService.removeToken(token.id)
                }
                if(!checkTokenValid) {
                    throw new HttpException('DeviceLimitExceeded', HttpStatus.FORBIDDEN)
                }
            }

            const premiums_mia = await this.purchaseService.getPurchaseByUserId_New(+user.id)
            user.avatar = AVATAR_DEFAULT
            let cToken = token
            if(!checkTokenValid) {
                const newToken = await this.authService.createdToken(user.id, token)
                cToken = newToken.id
            }
            user.accessToken = cToken
            user = { ...user, premiums_extra: purchase , premiums_mia: premiums_mia}
            user = new AccountDto(user)
            return res.status(200).json(user)
        } else {
            
            let user: any = inputs
            user.email = email
            if (!user.name) {
                user.name = name
            }


            const userCreated = await this.accountService.regiter(user)
            let token = await this.authService.generateToken({
                id: userCreated.id,
                deviceId: inputs.device_id
            })
            user.accessToken = token

            if (userCreated) {
                const dataDevice = {
                    userId: userCreated.id,
                    device: inputs.device,
                    deviceId: inputs.device_id,
                    platforms: platforms,
                    appVersion: inputs.app_version,
                    platformsVersion: inputs.platforms_version,
                }
                dataDevice.device = this.deviceService.replaceEmoji(dataDevice.device)
                try {
                    await this.deviceService.save(dataDevice)
                } catch (error) {
                    throw new HttpException('An error occurred while saving the device.', HttpStatus.EXPECTATION_FAILED)
                }
                let [cToken] = await Promise.all([this.authService.createdToken(userCreated.id, token)])
                if (cToken) {
                    userCreated.avatar = AVATAR_DEFAULT
                    userCreated["is_premium"] = false
                    userCreated["premium"] = {}
                    return res.status(201).json(new AccountDto(userCreated))
                }
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Đăng nhập thành công' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Đăng nhập lần đầu thành công' })
    @ApiResponse({ status: HttpStatus.FOUND, description: 'Đăng nhập không thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.NOT_ACCEPTABLE, description: 'Tài khoản đã bị khóa' })
    @ApiResponse({ status: HttpStatus.EXPECTATION_FAILED, description: 'Xảy ra lỗi trong quá trình lưu thiết bị' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Khi tài khoản là premium và bị quá giới hạn thiết bị' })
    @ApiOperation({
        description: `{
        "access_token": "required",
        "name": "",
        "device_id": "required",
        "device": "required",
        "platforms_version": "required",
        "app_version": "required"
      }` })
    @Post('loginWithGoogle')
    async loginWithGoogle(@Body() inputs: LoginGoogleDto, @Res() res: Response) {
        let name = inputs.name
        const {
            app_version,
            device_id: deviceId,
            id_token: id_token,
            device: deviceName,
            platforms: platforms,
            platforms_version: platformsVersion
        } = inputs

        let url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + id_token

        const { data } = await this.accountService.getDataRequests(url)

        const provider_id = data.sub
        const email = data.email
        const avatar = data.picture ? data.picture : AVATAR_DEFAULT
        if (!inputs.name && email) {
            name = email.split('@')[0]
        }

        let user: any = await this.accountService.find({ email: email })


        if (user) {
            if (user.activate_flag < 0) {
                throw new HttpException('Your account has been locked', HttpStatus.NOT_ACCEPTABLE)
            }
            let token = await this.authService.generateToken({
                id: user.id,
                deviceId: inputs.device_id
            })

            const dataDevice = {
                userId: user.id,
                device: inputs.device,
                deviceId: inputs.device_id,
                platforms: platforms,
                appVersion: inputs.app_version,
                platformsVersion: inputs.platforms_version,
            }
            dataDevice.device = this.deviceService.replaceEmoji(dataDevice.device)
            try {
                await this.deviceService.save(dataDevice)
            } catch (error) {
                throw new HttpException('An error occurred while saving the device.', HttpStatus.EXPECTATION_FAILED)
            }

            let [purchase, device]: [any, any] = await Promise.all([
                this.purchaseService.getPurchaseByUserId(user.id),
                this.deviceService.getDeviceId(user.id)
            ])

            const totalNewFormatTokenOfUser = await this.authService.findTotalNewFormatTokenOfUser(user.id)
            const checkTokenValid = totalNewFormatTokenOfUser.find(ele => ele.id == token)
            if(purchase[0]?.is_premium && totalNewFormatTokenOfUser.length >= 3) {
                const oldTokensOfUser = await this.authService.getAllOldTokenOfUser(user.id)
                for (const token of oldTokensOfUser) {
                    await this.authService.removeToken(token.id)
                }
                if(!checkTokenValid) {
                    throw new HttpException('DeviceLimitExceeded', HttpStatus.FORBIDDEN)
                }
            }
            const premiums_mia = await this.purchaseService.getPurchaseByUserId_New(+user.id)
            user.avatar = AVATAR_DEFAULT
            let cToken = token
            if(!checkTokenValid) {
                const newToken = await this.authService.createdToken(user.id, token)
                cToken = newToken.id
            }
            user.accessToken = cToken
            user = { ...user, premiums_extra: purchase, premiums_mia: premiums_mia}
            user = new AccountDto(user)
            return res.status(200).json(user)
            } else {
                let user: any = inputs
                user.email = email
                if (!user.name) {
                    user.name = name
                }   


            const userCreated = await this.accountService.regiter(user)
            let token = await this.authService.generateToken({
                id: userCreated.id,
                deviceId: inputs.device_id
            })
            user.accessToken = token
            if (userCreated) {
                const dataDevice = {
                    userId: userCreated.id,
                    device: inputs.device,
                    deviceId: inputs.device_id,
                    platforms: platforms,
                    appVersion: inputs.app_version,
                    platformsVersion: inputs.platforms_version,
                }
                dataDevice.device = this.deviceService.replaceEmoji(dataDevice.device)
                try {
                    await this.deviceService.save(dataDevice)
                } catch (error) {
                    throw new HttpException('An error occurred while saving the device.', HttpStatus.EXPECTATION_FAILED)
                }
                let [cToken] = await Promise.all([this.authService.createdToken(userCreated.id, token)])
                if (cToken) {
                    userCreated.avatar = AVATAR_DEFAULT
                    userCreated["is_premium"] = false
                    userCreated["premium"] = {}
                    return res.status(201).json(new AccountDto(userCreated))
                }
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Post('deleteAccount')
    async deleteAccount(@UserId() user_id: any, @Res() res: Response) {
        try {
            let deleted = await (this.accountService.deactiveAccount(user_id))
            if (deleted) {
                return res.status(200).json({ message: 'Delete user success.' })
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Thành công' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @Put('activeAccount/:userId')
    async activeAccount(@Param("userId") userId: string, @Res() res: Response) {
        try {
            let checkActive = await this.accountService.activeAccount(+userId)
            if (checkActive) {
                return res.status(200).json({ message: 'Active user success.' })
            }
        } catch (error) {
            Sentry.captureException(error);
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.CREATED, description: 'Tạo tài khoản thành công' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Người dùng đã tồn tại' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.EXPECTATION_FAILED, description: 'Xảy ra lỗi trong quá trình lưu thiết bị' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi server' })
    @Post('backup-user')
    async backupUserDelete(@Body() input: RegiterBackupDto): Promise<AccountDto> {
        try {
            const user = await this.accountService.find({ email: input.email })
            if (user) {
                throw new HttpException('Email already exists', HttpStatus.FORBIDDEN)
            }
            let newUser: any = input
            newUser.password = await bcrypt.hash(input.password, saltRounds)
            newUser.password = newUser.password.replace('$2b$10$', '$2y$10$'); // bcryptjs still uses the $2a$ prefix
            const userCreated = await this.accountService.regiter(newUser)

            let token = await this.authService.generateToken({
                id: userCreated.id,
                deviceId: input.device_id,
            })
            newUser.accessToken = token
            if (userCreated) {
                const dataDevice = {
                    userId: userCreated.id,
                    device: input.device,
                    deviceId: input.device_id,
                    platforms: input.platforms,
                    appVersion: input.app_version,
                    platformsVersion: input.platforms_version,
                }
                dataDevice.device = this.deviceService.replaceEmoji(dataDevice.device)
                try {
                    await this.deviceService.save(dataDevice)
                } catch (error) {
                    throw new HttpException('An error occurred while saving the device.', HttpStatus.EXPECTATION_FAILED)
                }
                let [cToken] = await Promise.all([this.authService.createdToken(userCreated.id, token)])
                if (cToken) {
                    userCreated.avatar = AVATAR_DEFAULT
                    userCreated["is_premium"] = false
                    userCreated["premium"] = {}
                    return new AccountDto(userCreated)
                }
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @ApiResponse({ status: HttpStatus.OK, description: 'Cập nhật thành công' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dữ liệu không hợp lệ' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Lỗi Server' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Lỗi xác thực' })
    @ApiOperation({
        summary: "Cập nhật thông tin user",
        description: "Khi nào các trường trong Dto thay đổi thì mới push"
    })
    @Put('updateUserInformation')
    async updateUserInformation(@UserId() user_id: any, @Body() input: UpdateUserInformationDto, @Res() res: Response) {
        try {
            const result = await this.accountService.updateUserInformation(user_id, input.name, input.day_of_birth, input.month_of_birth, input.year_of_birth, input.sex, input.phone, input.country)
            return res.status(HttpStatus.OK).json(result)
        }
        catch (e) {
            Sentry.captureException(e);
            if (e instanceof HttpException) {
                throw e
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}