import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsObject,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class VirtualBillDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  price: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  origin_price: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  affiliate?: {
    affiliate_code?: string;
    affiliate_package_key?: string;
    affiliate_discount?: string;
  };

  @ApiProperty()
  @IsString()
  @IsOptional()
  sale_id?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transaction_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  project_id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  qrcode_url?: string;
}

export class TransactionEntityAttributeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverBankName?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  issuerBankName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  remitterName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  remitterAccountNumber?: string;
}

export class TransactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionStatus: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionChannel: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  effectiveDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  debitOrCredit: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  virtualAccountInfo?: any;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  transactionEntityAttribute?: TransactionEntityAttributeDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionContent: string;
}

export class BankingActiceDataDto {
  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  virtual_bill: VirtualBillDto;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  transaction: TransactionDto;
}

export class AffiliateDto {
  @ApiProperty({
    description: 'Mã affiliate',
    example: 'AFF123',
    required: false
  })
  @IsString()
  @IsOptional()
  affiliate_code?: string;

  @ApiProperty({
    description: 'Khóa gói affiliate',
    example: 'PKG456',
    required: false
  })
  @IsString()
  @IsOptional()
  affiliate_package_key?: string;

  @ApiProperty({
    description: 'Giảm giá affiliate',
    example: '10',
    required: false
  })
  @IsString()
  @IsOptional()
  affiliate_discount?: string;
}
export class CreateVirtualBillDto {
  @ApiProperty({
    description: 'ID sản phẩm',
    example: 'migii_hsk_mia_lifetime_sale50',
  })
  @IsString()
  product_id: string

  @ApiProperty({
    description: 'Giá sản phẩm',
    example: 1599000,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Thông tin affiliate',
    type: AffiliateDto,
  })
  @ValidateNested()
  @Type(() => AffiliateDto)
  affiliate: AffiliateDto;
}

