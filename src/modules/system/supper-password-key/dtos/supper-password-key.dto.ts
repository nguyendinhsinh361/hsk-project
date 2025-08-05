import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString  } from "class-validator";

export class SupperPasswordKeyDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    superPass: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    keyUse: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    keyName: string
}
