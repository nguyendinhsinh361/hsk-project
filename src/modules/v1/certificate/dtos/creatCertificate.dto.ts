import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum ShareValue {
  SHARE = '1',
  NOT_SHARE = '0',
}

export class CreateCertificateDto {
  @ApiProperty({ description: 'họ tên' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'số điện thoại',  required: false})
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: 'ảnh chứng chỉ',
    type: String,
    format: 'binary',
    required: true,
  })
  certificateImg: string;

  @ApiProperty({ description: 'lời nhắn', required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ description: 'chia sẻ', required: true,default: ShareValue.SHARE, enum: ShareValue })
  @IsNotEmpty()
  @IsEnum(ShareValue)
  share: ShareValue = ShareValue.SHARE;
}
