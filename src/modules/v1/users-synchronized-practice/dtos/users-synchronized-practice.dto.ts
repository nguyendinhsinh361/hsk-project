import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString  } from "class-validator";

export class UpdateHistoryDto {
    @ApiProperty()
    @IsNotEmpty()
    scoringWriting: string
}
