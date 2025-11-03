import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export enum TransactionFilterType {
  ALL = 'All',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense',
}

/**
 * DTO cho query params khi lấy danh sách giao dịch
 */
export class GetTransactionsDto {
  @IsOptional()
  @IsEnum(TransactionFilterType, {
    message: 'Type must be All, Revenue, or Expense',
  })
  type?: TransactionFilterType = TransactionFilterType.ALL;

  // Lọc theo userId (sẽ inner join qua Accounts)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

