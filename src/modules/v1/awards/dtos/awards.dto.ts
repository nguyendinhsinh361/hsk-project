import { ApiProperty } from "@nestjs/swagger";
import { EventNameEnum } from "../enum/event-name.enum";
import { IsEnum } from "class-validator";

export class AwardsMiADto {
    @ApiProperty({ description: 'Nhập tên hoặc mã sự kiện trao giải', default: EventNameEnum.TRIAL_EVENT, enum: EventNameEnum })
    @IsEnum(EventNameEnum)
    eventName: EventNameEnum = EventNameEnum.TRIAL_EVENT

    @ApiProperty({ description: 'Nhập số ngày User được sử dụng premium: 1 Ngày = 86400000 Miliseconds' })
    premiumTime: string

    @ApiProperty({ description: 'Nhập số lượng chấm AI User tặng' })
    miaTotal: string
}

export class UserCustomDto {
    @ApiProperty({})
    info: string
}

export class ListUserCustomDto {
    @ApiProperty({})
    emails: string[]
}

