import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty   } from "class-validator";

export class IdsDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    ids: string[]
}
