import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class UserCustomDto {
    @ApiProperty({})
    info: string
}

export class ListUserCustomDto {
    @ApiProperty({})
    emails: string[]
}

