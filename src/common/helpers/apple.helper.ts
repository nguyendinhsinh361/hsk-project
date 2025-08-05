// import NodeRSA from 'node-rsa';
// import jwt from 'jsonwebtoken';
// import request_promise from 'request-promise';
// const APPLE_IDENTITY_URL = 'https://appleid.apple.com';
// import { HttpService } from "@nestjs/axios";
// import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { LoginAppleDto } from 'src/modules/v1/user/account/dtos/loginApple.dto';

// @Injectable()
// export class AppleId {
//   constructor(private readonly httpService: HttpService) {}

//     async getData(url: string): Promise<any> {
//         return this.httpService.axiosRef({
//             url,
//             method: 'GET'
//         })
//     }

//     async verify(inputs: LoginAppleDto){
//         const getAppleIdentityPublicKey = async (kid: string): Promise<any> => {
//             const url = APPLE_IDENTITY_URL + '/auth/keys'
//             const { data } = await this.getData(url)
//             const keys = data.keys
//             const key = keys.find((k: any) => k.kid === kid)
//             const pubKey = new NodeRSA()
//             pubKey.importKey(
//                 { n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') },
//                 'components-public',
//             )
//             return pubKey.exportKey('public')
//         }

//         // Xác thực người dùng qua token
//         let validationResponse: any
//         try {
//             const { header } = jwt.decode(accessToken, { complete: true }) as any
//             const applePublicKey = await getAppleIdentityPublicKey(header.kid)
//             validationResponse = jwt.verify(accessToken, applePublicKey, {
//                 algorithms: ['RS256'],
//             }) as any
//         } catch (error) {
//             throw new HttpException('Login err', HttpStatus.FOUND)
//         }

//         if (validationResponse.iss !== APPLE_IDENTITY_URL
//             || validationResponse.aud !== 'com.eup.migiisat'
//         ) {
//             throw new HttpException('Login err', HttpStatus.FOUND)
//         }

//         const provider_id = validationResponse.sub
//         const email = validationResponse.email
//         const avatar = validationResponse.picture ? validationResponse.picture : "https://mytest.eupgroup.net/assets/img/avatar_default.png"
//         if (!inputs.name && email) {
//             name = email.split('@')[0]
//         }
//     }

// }
