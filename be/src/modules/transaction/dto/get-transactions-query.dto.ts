import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export enum TransactionFilterType {
  ALL = 'All',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense',
}

export class GetTransactionsQueryDto {
  @IsEnum(TransactionFilterType, {
    message: 'Type phải là một trong các giá trị: All, Revenue, Expense',
  })
  @IsOptional()
  type?: TransactionFilterType = TransactionFilterType.ALL;

  @IsInt({ message: 'Limit phải là số nguyên' })
  @Min(1, { message: 'Limit phải lớn hơn 0' })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsInt({ message: 'Offset phải là số nguyên' })
  @Min(0, { message: 'Offset phải lớn hơn hoặc bằng 0' })
  @Type(() => Number)
  @IsOptional()
  offset?: number = 0;
}

