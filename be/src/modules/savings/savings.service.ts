import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transaction/entities/transaction.entity';
import { Account } from '../account/entities/account.entity';

export interface MonthlySavingData {
  month: string; // Format: "01" to "12"
  saving: number; // Revenue - Expense
}

export interface SavingSummaryResponse {
  this_year: MonthlySavingData[];
  last_year: MonthlySavingData[];
}

@Injectable()
export class SavingsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * Tính toán tổng tiết kiệm (Revenue - Expense) theo tháng và so sánh theo năm
   * @param userId ID của user hiện tại (từ token)
   * @param year Năm cần tính toán
   * @returns Object chứa this_year và last_year với dữ liệu theo tháng (01-12)
   */
  async getSavingSummary(userId: number, year: number): Promise<SavingSummaryResponse> {
    // Validate year
    if (!year || year < 2000 || year > 2100) {
      throw new BadRequestException('Năm không hợp lệ');
    }

    // 1. Kiểm tra bảo mật: Lấy tất cả account_id của user hiện tại
    const userAccounts = await this.accountRepository.find({
      where: { userId },
      select: ['accountId'],
    });

    if (userAccounts.length === 0) {
      // Trả về dữ liệu rỗng cho cả 2 năm
      return {
        this_year: this.generateEmptyMonthlyData(),
        last_year: this.generateEmptyMonthlyData(),
      };
    }

    const accountIds = userAccounts.map((account) => account.accountId);

    // 2. Tính toán cho năm hiện tại (year)
    const thisYearData = await this.calculateYearlySavings(accountIds, year);

    // 3. Tính toán cho năm trước (year - 1)
    const lastYearData = await this.calculateYearlySavings(accountIds, year - 1);

    return {
      this_year: thisYearData,
      last_year: lastYearData,
    };
  }

  /**
   * Tính toán tiết kiệm theo tháng cho một năm cụ thể
   * @param accountIds Danh sách account IDs của user
   * @param year Năm cần tính toán
   * @returns Mảng 12 tháng với dữ liệu tiết kiệm (Revenue - Expense)
   */
  private async calculateYearlySavings(
    accountIds: number[],
    year: number,
  ): Promise<MonthlySavingData[]> {
    // Truy vấn Revenue theo tháng
    const revenueResults = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('DATE_FORMAT(transaction.transactionDate, "%m")', 'month')
      .addSelect('SUM(transaction.amount)', 'totalRevenue')
      .where('transaction.accountId IN (:...accountIds)', { accountIds })
      .andWhere('transaction.type = :type', { type: TransactionType.REVENUE })
      .andWhere('YEAR(transaction.transactionDate) = :year', { year })
      .groupBy('DATE_FORMAT(transaction.transactionDate, "%m")')
      .getRawMany();

    // Truy vấn Expense theo tháng
    const expenseResults = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('DATE_FORMAT(transaction.transactionDate, "%m")', 'month')
      .addSelect('SUM(transaction.amount)', 'totalExpense')
      .where('transaction.accountId IN (:...accountIds)', { accountIds })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('YEAR(transaction.transactionDate) = :year', { year })
      .groupBy('DATE_FORMAT(transaction.transactionDate, "%m")')
      .getRawMany();

    // Tạo map để dễ lookup
    const revenueMap = new Map<string, number>();
    revenueResults.forEach((row) => {
      revenueMap.set(row.month, parseFloat(row.totalRevenue) || 0);
    });

    const expenseMap = new Map<string, number>();
    expenseResults.forEach((row) => {
      expenseMap.set(row.month, parseFloat(row.totalExpense) || 0);
    });

    // Tạo mảng đầy đủ 12 tháng (01-12) với dữ liệu tiết kiệm
    const monthlyData: MonthlySavingData[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthStr = String(month).padStart(2, '0'); // "01", "02", ..., "12"
      const revenue = revenueMap.get(monthStr) || 0;
      const expense = expenseMap.get(monthStr) || 0;
      const saving = revenue - expense;

      monthlyData.push({
        month: monthStr,
        saving: Math.round(saving * 100) / 100, // Làm tròn 2 chữ số thập phân
      });
    }

    return monthlyData;
  }

  /**
   * Tạo mảng dữ liệu rỗng cho 12 tháng
   * @returns Mảng 12 tháng với saving = 0
   */
  private generateEmptyMonthlyData(): MonthlySavingData[] {
    const data: MonthlySavingData[] = [];
    for (let month = 1; month <= 12; month++) {
      data.push({
        month: String(month).padStart(2, '0'),
        saving: 0,
      });
    }
    return data;
  }
}

