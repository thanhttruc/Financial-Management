import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transaction/entities/transaction.entity';
import { Account } from '../account/entities/account.entity';
import { ExpenseDetail } from '../expense-detail/entities/expense-detail.entity';
import { Category } from '../category/entities/category.entity';

export interface MonthlyExpenseSummary {
  month: string; // Format: "YYYY-MM" hoặc "Jan 2024"
  totalExpense: number;
}

export interface ExpenseItemDetail {
  itemDescription: string;
  amount: number;
  transactionDate: string; // Format: YYYY-MM-DD
}

export interface ExpenseBreakdownItem {
  categoryId: number;
  categoryName: string;
  total: number;
  changePercent: number;
  items: ExpenseItemDetail[];
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(ExpenseDetail)
    private readonly expenseDetailRepository: Repository<ExpenseDetail>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Tính toán tổng chi tiêu theo tháng của user
   * @param userId ID của user hiện tại (từ token)
   * @returns Mảng các object chứa month và totalExpense
   */
  async getMonthlyExpenseSummary(userId: number): Promise<MonthlyExpenseSummary[]> {
    // 1. Kiểm tra bảo mật: Lấy tất cả account_id của user hiện tại
    const userAccounts = await this.accountRepository.find({
      where: { userId },
      select: ['accountId'],
    });

    if (userAccounts.length === 0) {
      return [];
    }

    const accountIds = userAccounts.map((account) => account.accountId);

    // 2. Xử lý DB: Truy vấn Transactions với GROUP BY month/year và SUM amount
    const results = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('DATE_FORMAT(transaction.transactionDate, "%Y-%m")', 'month')
      .addSelect('SUM(transaction.amount)', 'totalExpense')
      .where('transaction.accountId IN (:...accountIds)', { accountIds })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .groupBy('DATE_FORMAT(transaction.transactionDate, "%Y-%m")')
      .orderBy('month', 'ASC')
      .getRawMany();

    // 3. Chuyển đổi kết quả thành format yêu cầu
    const summary: MonthlyExpenseSummary[] = results.map((row) => {
      // Chuyển đổi "YYYY-MM" thành format ngắn gọn như "Jan 2024"
      const [year, month] = row.month.split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const monthIndex = parseInt(month, 10) - 1;
      const monthShort = monthNames[monthIndex];
      
      return {
        month: `${monthShort} ${year}`,
        totalExpense: parseFloat(row.totalExpense) || 0,
      };
    });

    return summary;
  }

  /**
   * Lấy breakdown chi tiêu theo danh mục cho tháng được chỉ định
   * @param userId ID của user hiện tại (từ token)
   * @param month Tháng cần lấy breakdown (format: YYYY-MM)
   * @returns Mảng các object chứa categoryId, categoryName, total, changePercent, items
   */
  async getExpenseBreakdown(userId: number, month: string): Promise<ExpenseBreakdownItem[]> {
    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      throw new BadRequestException('Định dạng tháng không hợp lệ. Vui lòng sử dụng format YYYY-MM');
    }

    // 1. Kiểm tra bảo mật: Lấy tất cả account_id của user hiện tại
    const userAccounts = await this.accountRepository.find({
      where: { userId },
      select: ['accountId'],
    });

    if (userAccounts.length === 0) {
      throw new BadRequestException('Không có dữ liệu chi tiêu cho tháng này.');
    }

    const accountIds = userAccounts.map((account) => account.accountId);

    // 2. Xử lý DB: Lọc giao dịch chi tiêu trong tháng được chỉ định, nhóm theo Category
    // Query để lấy breakdown theo category cho tháng hiện tại với thông tin chi tiết từng transaction
    const currentMonthTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.expenseDetail', 'expenseDetail')
      .innerJoin('expenseDetail.category', 'category')
      .select('category.categoryId', 'categoryId')
      .addSelect('category.categoryName', 'categoryName')
      .addSelect('transaction.itemDescription', 'itemDescription')
      .addSelect('transaction.amount', 'amount')
      .addSelect('DATE_FORMAT(transaction.transactionDate, "%Y-%m-%d")', 'transactionDate')
      .where('transaction.accountId IN (:...accountIds)', { accountIds })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('DATE_FORMAT(transaction.transactionDate, "%Y-%m") = :month', { month })
      .orderBy('transaction.transactionDate', 'DESC')
      .getRawMany();

    if (currentMonthTransactions.length === 0) {
      throw new BadRequestException('Không có dữ liệu chi tiêu cho tháng này.');
    }

    // 3. Tính toán: Tính total cho mỗi Category và lấy danh sách items chi tiết
    const categoryMap = new Map<number, {
      categoryId: number;
      categoryName: string;
      total: number;
      items: ExpenseItemDetail[];
    }>();

    currentMonthTransactions.forEach((row) => {
      const categoryId = row.categoryId;
      const amount = parseFloat(row.amount) || 0;

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName: row.categoryName,
          total: 0,
          items: [],
        });
      }

      const categoryData = categoryMap.get(categoryId)!;
      categoryData.total += amount;
      categoryData.items.push({
        itemDescription: row.itemDescription,
        amount: amount,
        transactionDate: row.transactionDate,
      });
    });

    const currentMonthData = Array.from(categoryMap.values());

    // 4. Tỷ lệ Thay đổi: Truy vấn dữ liệu tháng trước (month - 1)
    const prevMonth = this.getPreviousMonth(month);
    const prevMonthResults = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.expenseDetail', 'expenseDetail')
      .innerJoin('expenseDetail.category', 'category')
      .select('category.categoryId', 'categoryId')
      .addSelect('SUM(transaction.amount)', 'total')
      .where('transaction.accountId IN (:...accountIds)', { accountIds })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('DATE_FORMAT(transaction.transactionDate, "%Y-%m") = :prevMonth', { prevMonth })
      .groupBy('category.categoryId')
      .getRawMany();

    const prevMonthDataMap = new Map<number, number>();
    prevMonthResults.forEach((row) => {
      prevMonthDataMap.set(row.categoryId, parseFloat(row.total) || 0);
    });

    // 5. Tính changePercent cho mỗi Category
    const breakdown: ExpenseBreakdownItem[] = currentMonthData.map((item) => {
      const prevTotal = prevMonthDataMap.get(item.categoryId) || 0;
      let changePercent = 0;

      if (prevTotal > 0) {
        changePercent = ((item.total - prevTotal) / prevTotal) * 100;
      } else if (item.total > 0) {
        // Nếu tháng trước không có dữ liệu nhưng tháng này có, coi như tăng 100%
        changePercent = 100;
      }

      return {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        total: item.total,
        changePercent: Math.round(changePercent * 100) / 100, // Làm tròn 2 chữ số thập phân
        items: item.items.slice(0, 10), // Giới hạn tối đa 10 items để tránh quá tải
      };
    });

    return breakdown;
  }

  /**
   * Tính tháng trước từ tháng hiện tại (format: YYYY-MM)
   * @param month Tháng hiện tại (format: YYYY-MM)
   * @returns Tháng trước (format: YYYY-MM)
   */
  private getPreviousMonth(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    date.setMonth(date.getMonth() - 1);
    const prevYear = date.getFullYear();
    const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
    return `${prevYear}-${prevMonth}`;
  }
}

