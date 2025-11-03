import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';

// Import các entity
import { User } from './modules/user/entities/user.entity';
import { Account } from './modules/account/entities/account.entity';
import { Transaction } from './modules/transaction/entities/transaction.entity';
import { Category } from './modules/category/entities/category.entity';
import { ExpenseDetail } from './modules/expense-detail/entities/expense-detail.entity';
import { Bill } from './modules/bill/entities/bill.entity';
import { Goal } from './modules/goal/entities/goal.entity';

// Import controllers
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { BillModule } from './modules/bill/bill.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { AccountModule } from './modules/account/account.module';
import { GoalModule } from './modules/goal/goal.module';

@Module({
  imports: [
    // Cấu hình ConfigModule để đọc biến môi trường
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),

    // Import Auth Module
    AuthModule,

    // Import Account Module
    AccountModule,

    // Import Transaction Module
    TransactionModule,

    // Import Bill Module
    BillModule,

    // Import Expenses Module
    ExpensesModule,

    // Import Goal Module
    GoalModule,

    // Cấu hình TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'mysql',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [
            User,
            Account,
            Transaction,
            Category,
            ExpenseDetail,
            Bill,
            Goal,
          ],
          synchronize: process.env.NODE_ENV === 'development',
          logging: process.env.NODE_ENV === 'development',
          charset: 'utf8mb4',
          timezone: '+00:00',
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

