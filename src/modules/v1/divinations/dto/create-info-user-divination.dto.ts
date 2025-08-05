import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsDate } from 'class-validator';

export class CreateInfoUserDto {
  @ApiProperty({ name: 'username', example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    name: 'birthday',
    example: '14/02/2024',
    description: 'Birthday in format DD/MM/YYYY',
  })
  @IsNotEmpty()
  @Transform(({ value }) => {
    const [day, month, year] = value.split('/');
    return new Date(year, month - 1, day);
  })
  @IsDate()
  birthday: Date;
}
