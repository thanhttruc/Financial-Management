import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transaction/entities/transaction.entity';
import { ExpenseDetail } from '../expense-detail/entities/expense-detail.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(ExpenseDetail)
    private readonly expenseDetailRepository: Repository<ExpenseDetail>,
  ) {}

  /**
   * Lấy tổng chi tiêu theo tháng (12 tháng gần nhất)
   */
  async getMonthlyExpenseSummary(userId: number) {
    try {
      const raw = await this.transactionRepository
        .createQueryBuilder('t')
        .innerJoin('t.account', 'a')
        .where('a.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
        .select('MONTH(t.transactionDate)', 'monthNumber')
        .addSelect('SUM(t.amount)', 'total')
        .groupBy('MONTH(t.transactionDate)')
        .orderBy('MONTH(t.transactionDate)')
        .getRawMany<{ monthNumber: string; total: string }>();

      // Map kết quả sang 12 tháng (Jan..Dec)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthTotals = new Map<number, number>();

      raw.forEach((r) => {
        const m = Number(r.monthNumber);
        const total = parseFloat(r.total);
        if (!Number.isNaN(m)) monthTotals.set(m, total);
      });

      const data = monthNames.map((name, idx) => {
        const monthIndex = idx + 1;
        return {
          month: name,
          totalExpense: Number((monthTotals.get(monthIndex) || 0).toFixed(2)),
        };
      });

      return data;
    } catch (error) {
      console.error('❌ Lỗi getMonthlyExpenseSummary:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể lấy dữ liệu chi tiêu.',
        error: error.message,
      });
    }
  }

  /**
   * Lấy chi tiết chi tiêu theo danh mục (Expense Breakdown)
   * @param userId - ID người dùng
   * @param month - Tháng định dạng "YYYY-MM" (ví dụ: "2025-05"), mặc định là tháng hiện tại
   */
  async getExpenseBreakdown(userId: number, month?: string) {
    try {
      // Parse tháng: nếu không có thì dùng tháng hiện tại
      let year: number;
      let monthNumber: number;
      
      if (month) {
        const [y, m] = month.split('-').map(Number);
        if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
          throw new InternalServerErrorException({
            success: false,
            message: 'Định dạng tháng không hợp lệ. Sử dụng định dạng YYYY-MM (ví dụ: 2025-05).',
          });
        }
        year = y;
        monthNumber = m;
      } else {
        const now = new Date();
        year = now.getFullYear();
        monthNumber = now.getMonth() + 1; // getMonth() trả về 0-11
      }

      // Tính tháng trước để so sánh
      let prevYear = year;
      let prevMonth = monthNumber - 1;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = year - 1;
      }

      // Query chi tiết chi tiêu của tháng hiện tại
      const currentMonthData = await this.expenseDetailRepository
        .createQueryBuilder('ed')
        .leftJoinAndSelect('ed.transaction', 't')
        .innerJoin('t.account', 'a')
        .leftJoinAndSelect('ed.category', 'c')
        .where('a.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
        .andWhere('YEAR(t.transactionDate) = :year', { year })
        .andWhere('MONTH(t.transactionDate) = :month', { month: monthNumber })
        .getMany();

      // Query chi tiết chi tiêu của tháng trước
      const previousMonthData = await this.expenseDetailRepository
        .createQueryBuilder('ed')
        .innerJoin('ed.transaction', 't')
        .innerJoin('t.account', 'a')
        .leftJoinAndSelect('ed.category', 'c')
        .where('a.userId = :userId', { userId })
        .andWhere('t.type = :type', { type: TransactionType.EXPENSE })
        .andWhere('YEAR(t.transactionDate) = :year', { year: prevYear })
        .andWhere('MONTH(t.transactionDate) = :month', { month: prevMonth })
        .getMany();

      // Nhóm theo category cho tháng hiện tại
      const categoryMap = new Map<
        number,
        {
          categoryId: number;
          categoryName: string;
          total: number;
          subCategories: Array<{ name: string; amount: number; date: string }>;
        }
      >();

      currentMonthData.forEach((ed) => {
        const catId = ed.category.categoryId;
        const catName = ed.category.categoryName;

        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            categoryId: catId,
            categoryName: catName,
            total: 0,
            subCategories: [],
          });
        }

        const cat = categoryMap.get(catId)!;
        const amount = Number(ed.subCategoryAmount);
        cat.total += amount;
        cat.subCategories.push({
          name: ed.subCategoryName || 'Khác',
          amount: amount,
          date: ed.transaction.transactionDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        });
      });

      // Tính tổng theo category cho tháng trước
      const prevCategoryTotals = new Map<number, number>();
      previousMonthData.forEach((ed) => {
        const catId = ed.category.categoryId;
        const amount = Number(ed.subCategoryAmount);
        prevCategoryTotals.set(catId, (prevCategoryTotals.get(catId) || 0) + amount);
      });

      // Tính changePercent và format kết quả
      const result = Array.from(categoryMap.values()).map((cat) => {
        const prevTotal = prevCategoryTotals.get(cat.categoryId) || 0;
        let changePercent = 0;
        if (prevTotal > 0) {
          changePercent = ((cat.total - prevTotal) / prevTotal) * 100;
        } else if (cat.total > 0) {
          changePercent = 100; // Tăng 100% nếu tháng trước = 0
        }

        return {
          category: cat.categoryName,
          total: Number(cat.total.toFixed(2)),
          changePercent: Number(changePercent.toFixed(1)),
          subCategories: cat.subCategories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), // Sắp xếp mới nhất trước
        };
      });

      // Sắp xếp theo total giảm dần
      result.sort((a, b) => b.total - a.total);

      if (result.length === 0) {
        throw new NotFoundException({
          success: false,
          message: 'Không có dữ liệu chi tiêu cho tháng này.',
        });
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('❌ Lỗi getExpenseBreakdown:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể lấy dữ liệu chi tiết chi tiêu.',
        error: error.message,
      });
    }
  }
}
