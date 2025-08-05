import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class ReasonCancelDto {
    @ApiProperty({ default: 'ID của người dùng, nếu không có userId => Không truyền lên' })
    @IsNumber()
    @IsOptional()
    userId?: number = null

    @ApiProperty({ default: 'Lý do hủy' })
    description: string
}