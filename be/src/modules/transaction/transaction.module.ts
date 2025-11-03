import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { ExpenseDetail } from '../expense-detail/entities/expense-detail.entity';
import { Account } from '../account/entities/account.entity';

/**
 * Module quản lý transactions
 */
@Module({
  imports: [TypeOrmModule.forFeature([Transaction, ExpenseDetail, Account])],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}

