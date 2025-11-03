import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Module quản lý accounts (tài khoản ngân hàng)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Account, Transaction]), AuthModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
