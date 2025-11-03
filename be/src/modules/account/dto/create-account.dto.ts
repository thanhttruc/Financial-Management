import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AccountType } from '../entities/account.entity';

/**
 * DTO: Validate payload when creating a new account
 */
export class CreateAccountDto {
  @ApiProperty({ example: 'TPBank', description: 'Tên ngân hàng' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  bank_name!: string;

  @ApiProperty({ 
    example: 'Checking', 
    description: 'Loại tài khoản',
    enum: AccountType,
  })
  @IsEnum(AccountType, {
    message: 'account_type must be one of: Checking, Credit Card, Savings, Investment, Loan',
  })
  account_type!: AccountType;

  @ApiProperty({ example: 'Quận 4', description: 'Chi nhánh ngân hàng', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  branch_name?: string;

  @ApiProperty({ example: '9704221122334455667', description: 'Số tài khoản đầy đủ' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  account_number_full!: string;

  @ApiProperty({ example: 2500000, description: 'Số dư khởi tạo (phải >= 0)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'balance must be greater than or equal to 0' })
  balance!: number;
}

