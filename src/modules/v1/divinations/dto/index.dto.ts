import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateHistoryDivinationDto {
  @ApiProperty({ name: 'infoUserId', example: 1 })
  @IsNotEmpty()
  @IsInt()
  infoUserId: number;

  @ApiProperty({
    name: 'divinationId',
    example: '1',
    description: 'Id của quẻ mùng 1 or 2 ...',
  })
  @IsNotEmpty()
  @IsInt()
  divinationId: number;

  @ApiProperty({
    name: 'contentId',
    example: 1,
    description: 'id của nội dung quẻ',
  })
  @IsNotEmpty()
  @IsInt()
  contentId: number;
}
