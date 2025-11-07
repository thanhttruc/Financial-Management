import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Account } from '../account/entities/account.entity';
import { ExpenseDetail } from '../expense-detail/entities/expense-detail.entity';
import { Category } from '../category/entities/category.entity';
import { TransactionsService } from './transaction.service';
import { TransactionsController } from './transaction.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Account, ExpenseDetail, Category]),
    AuthModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionModule {}

