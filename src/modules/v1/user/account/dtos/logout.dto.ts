import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LogoutDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    device_id: string
}