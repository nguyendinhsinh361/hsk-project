import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEmail, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CertificateStatusEnumTest } from '../enums/certificateStatusEnum.enum';
import { CreateCertificateDto } from './creatCertificate.dto';


export class UpdateCertificateDto {
  @ApiProperty({ description: 'Cập nhật trạng thái', required: true,default: CertificateStatusEnumTest.ACTIVE, enum: CertificateStatusEnumTest })
  @IsNotEmpty()
  @IsEnum(CertificateStatusEnumTest)
  status: CertificateStatusEnumTest = CertificateStatusEnumTest.ACTIVE;
}

export class UpdateImgCertificateDto extends  PickType(CreateCertificateDto, ['certificateImg']){}