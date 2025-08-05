import { IsOptional } from "class-validator";

export class AccessTokenDTO {
    @IsOptional()
    id: string
}