import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, IsBoolean, IsNumber} from "class-validator";
import { User } from "../entities/user.entity";

export class AccountDto {
    id: number
    email: string;
    name: string;
    accessToken: string;
    phone: string;
    day_of_birth: number;
    month_of_birth: number;
    year_of_birth: number;
    country: string;
    language: string;
    sex: number;
    avatar: string;
    premiums_extra: any;
    devices: any;
    premiums_mia: any

    constructor(input: any){
        this.id = input.id
        this.email = input.email
        this.name = input.name
        this.accessToken = input.accessToken
        this.phone = input.phone
        this.day_of_birth = input.day_of_birth
        this.month_of_birth = input.month_of_birth
        this.year_of_birth = input.year_of_birth
        this.country = input.country
        this.language = input.language
        this.sex = input.sex
        this.avatar = input.avatar
        this.premiums_extra = input.premiums_extra
        this.devices = input.devices
        this.premiums_mia = input.premiums_mia
    }

}

