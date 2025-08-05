import { ApiProperty, PickType } from "@nestjs/swagger";

export class RoutesDefaultDto {
    @ApiProperty({
      description: 'Nội dung route json',
      type: String,
      format: 'binary',
      required: true,
    })
    routeDefault: string;
}