import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";


export class Tracking {
    @ApiProperty({ default: "Attention_Practice100" })
    @IsString()
    tag: string
}
export class UserTrackingDto {
    @IsArray()
    content: Tracking[]
}

export class OutputUserDto {
    User: any
    constructor(input: any) {
        this.User = input
    }
}