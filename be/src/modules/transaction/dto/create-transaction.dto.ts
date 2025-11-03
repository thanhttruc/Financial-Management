import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsDateString, ValidateIf } from 'class-validator';
import { TransactionStatus, TransactionType } from '../entities/transaction.entity';

/**
 * DTO để tạo mới một Transaction
 */
export class CreateTransactionDto {
  @IsInt()
  @IsPositive()
  accountId: number;

  @IsDateString()
  transactionDate: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  itemDescription: string;

  @IsOptional()
  @IsString()
  shopName?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  // Expense Detail fields (chỉ bắt buộc khi type = Expense)
  @ValidateIf((o) => o.type === TransactionType.EXPENSE)
  @IsInt()
  @IsPositive()
  categoryId?: number;

  @ValidateIf((o) => o.type === TransactionType.EXPENSE)
  @IsOptional()
  @IsString()
  subCategoryName?: string;

  @ValidateIf((o) => o.type === TransactionType.EXPENSE)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  subCategoryAmount?: number;
}


