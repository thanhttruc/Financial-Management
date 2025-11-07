import { IsNotEmpty, IsNumber, IsEnum, IsString, IsDateString, Min, IsInt, IsOptional, ValidateIf } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsInt({ message: 'Account ID phải là số nguyên' })
  @IsNotEmpty({ message: 'Account ID không được để trống' })
  accountId: number;

  @IsEnum(TransactionType, { message: 'Loại giao dịch phải là Revenue hoặc Expense' })
  @IsNotEmpty({ message: 'Loại giao dịch không được để trống' })
  type: TransactionType;

  @IsString({ message: 'Tên giao dịch phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên giao dịch không được để trống' })
  itemDescription: string;

  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0.01, { message: 'Số tiền phải lớn hơn 0' })
  @IsNotEmpty({ message: 'Số tiền không được để trống' })
  amount: number;

  @IsDateString({}, { message: 'Ngày giao dịch không hợp lệ' })
  @IsNotEmpty({ message: 'Ngày giao dịch không được để trống' })
  transactionDate: string;

  // Category ID - bắt buộc khi type = Expense
  @ValidateIf((o) => o.type === TransactionType.EXPENSE)
  @IsInt({ message: 'Category ID phải là số nguyên' })
  @IsNotEmpty({ message: 'Danh mục không được để trống khi loại giao dịch là Chi tiêu' })
  categoryId?: number;

  @IsString({ message: 'Tên cửa hàng phải là chuỗi' })
  @IsOptional()
  shopName?: string;

  @IsString({ message: 'Phương thức thanh toán phải là chuỗi' })
  @IsOptional()
  paymentMethod?: string;
}

