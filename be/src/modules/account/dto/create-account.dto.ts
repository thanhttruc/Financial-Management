import { IsNotEmpty, IsString, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @IsString({ message: 'Tên ngân hàng phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên ngân hàng không được để trống' })
  bankName: string;

  @IsEnum(AccountType, { message: 'Loại tài khoản không hợp lệ' })
  @IsNotEmpty({ message: 'Loại tài khoản không được để trống' })
  accountType: AccountType;

  @IsString({ message: 'Chi nhánh phải là chuỗi' })
  @IsOptional()
  branchName?: string;

  @IsString({ message: 'Số tài khoản đầy đủ phải là chuỗi' })
  @IsNotEmpty({ message: 'Số tài khoản đầy đủ không được để trống' })
  accountNumberFull: string;

  @IsNumber({}, { message: 'Số dư khởi tạo phải là số' })
  @Min(0, { message: 'Số dư khởi tạo phải lớn hơn hoặc bằng 0' })
  balance: number;
}

