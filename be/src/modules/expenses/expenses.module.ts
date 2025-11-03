import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Account } from '../account/entities/account.entity';
import { ExpenseDetail } from '../expense-detail/entities/expense-detail.entity';
import { Category } from '../category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Account, ExpenseDetail, Category])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}


