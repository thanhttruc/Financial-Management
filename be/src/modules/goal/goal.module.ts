import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { Category } from '../category/entities/category.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Account } from '../account/entities/account.entity';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

/**
 * Module quản lý Goals (Mục tiêu tài chính)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Goal, Category, Transaction, Account])],
  controllers: [GoalController],
  providers: [GoalService],
  exports: [GoalService],
})
export class GoalModule {}

