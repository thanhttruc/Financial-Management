import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AccountType } from '../entities/account.entity';

/**
 * DTO: Validate payload when updating an account
 */
export class UpdateAccountDto {
  @ApiProperty({ example: 'Vietcombank', description: 'Tên ngân hàng', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bank_name?: string;

  @ApiProperty({ 
    example: 'Checking', 
    description: 'Loại tài khoản',
    enum: AccountType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AccountType, {
    message: 'account_type must be one of: Checking, Credit Card, Savings, Investment, Loan',
  })
  account_type?: AccountType;

  @ApiProperty({ example: 'Quận 3', description: 'Chi nhánh ngân hàng', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  branch_name?: string;

  @ApiProperty({ example: '9704221234567890123', description: 'Số tài khoản đầy đủ', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  account_number_full?: string;

  @ApiProperty({ example: 4500000, description: 'Số dư (phải >= 0)', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'balance must be greater than or equal to 0' })
  balance?: number;
}

