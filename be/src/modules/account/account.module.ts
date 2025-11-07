import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { ExpenseDetail } from '../expense-detail/entities/expense-detail.entity';
import { AccountsService } from './account.service';
import { AccountsController } from './account.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction, ExpenseDetail]),
    AuthModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountModule {}

