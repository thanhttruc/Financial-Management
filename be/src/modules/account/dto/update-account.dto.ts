import { IsString, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class UpdateAccountDto {
  @IsString({ message: 'Tên ngân hàng phải là chuỗi' })
  @IsOptional()
  bankName?: string;

  @IsEnum(AccountType, { message: 'Loại tài khoản không hợp lệ' })
  @IsOptional()
  accountType?: AccountType;

  @IsString({ message: 'Chi nhánh phải là chuỗi' })
  @IsOptional()
  branchName?: string;

  @IsString({ message: 'Số tài khoản đầy đủ phải là chuỗi' })
  @IsOptional()
  accountNumberFull?: string;

  @IsNumber({}, { message: 'Số dư phải là số' })
  @Min(0, { message: 'Số dư phải lớn hơn hoặc bằng 0' })
  @IsOptional()
  balance?: number;
}

