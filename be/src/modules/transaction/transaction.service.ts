import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Account } from '../account/entities/account.entity';
import { ExpenseDetail } from '../expense-detail/entities/expense-detail.entity';
import { Category } from '../category/entities/category.entity';
import { GetTransactionsQueryDto, TransactionFilterType } from './dto/get-transactions-query.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(ExpenseDetail)
    private readonly expenseDetailRepository: Repository<ExpenseDetail>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Lấy danh sách giao dịch của user với phân trang và lọc
   * @param userId ID của user hiện tại
   * @param queryParams Query parameters: type, limit, offset
   * @returns Object chứa data, total, hasMore
   */
  async getTransactions(
    userId: number,
    queryParams: GetTransactionsQueryDto,
  ): Promise<{ data: Transaction[]; total: number; hasMore: boolean }> {
    const { type = TransactionFilterType.ALL, limit = 10, offset = 0 } = queryParams;

    // 1. Kiểm tra bảo mật: Lấy tất cả account_id của user hiện tại
    const userAccounts = await this.accountRepository.find({
      where: { userId },
      select: ['accountId'],
    });

    if (userAccounts.length === 0) {
      return {
        data: [],
        total: 0,
        hasMore: false,
      };
    }

    const accountIds = userAccounts.map((account) => account.accountId);

    // 2. Xây dựng query builder
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.accountId IN (:...accountIds)', { accountIds });

    // 3. Xử lý Lọc: Áp dụng điều kiện type (bỏ qua nếu là 'All')
    if (type !== TransactionFilterType.ALL) {
      const transactionType =
        type === TransactionFilterType.REVENUE ? TransactionType.REVENUE : TransactionType.EXPENSE;
      queryBuilder.andWhere('transaction.type = :transactionType', { transactionType });
    }

    // 4. Sắp xếp: Mặc định sắp xếp theo transactionDate DESC
    queryBuilder.orderBy('transaction.transactionDate', 'DESC');

    // 5. Lấy tổng số bản ghi (trước khi áp dụng limit/offset)
    const total = await queryBuilder.getCount();

    // 6. Xử lý Phân trang: Áp dụng limit và offset
    queryBuilder.skip(offset).take(limit);

    // 7. Lấy dữ liệu
    const transactions = await queryBuilder.getMany();

    // 8. Tính toán hasMore
    const hasMore = offset + limit < total;

    return {
      data: transactions,
      total,
      hasMore,
    };
  }

  /**
   * Tạo giao dịch mới và cập nhật số dư tài khoản
   * @param userId ID của user hiện tại
   * @param transactionData Dữ liệu giao dịch
   * @returns Transaction đã tạo
   */
  async createTransaction(
    userId: number,
    transactionData: CreateTransactionDto,
  ): Promise<Transaction> {
    // 1. Kiểm tra bảo mật: Đảm bảo accountId thuộc về userId hiện tại
    const account = await this.accountRepository.findOne({
      where: { accountId: transactionData.accountId, userId },
    });

    if (!account) {
      throw new BadRequestException('Invalid or missing transaction data');
    }

    // 2. Validation: Kiểm tra dữ liệu có hợp lệ không (amount > 0)
    // Validation đã được xử lý bởi DTO và class-validator
    if (!transactionData.amount || transactionData.amount <= 0) {
      throw new BadRequestException('Invalid or missing transaction data');
    }

    // 2.1. Validation: Nếu type = Expense, categoryId phải có
    if (transactionData.type === TransactionType.EXPENSE) {
      if (!transactionData.categoryId) {
        throw new BadRequestException('Category ID is required for Expense transactions');
      }
      
      // Kiểm tra category có tồn tại không
      const category = await this.categoryRepository.findOne({
        where: { categoryId: transactionData.categoryId },
      });
      
      if (!category) {
        throw new BadRequestException('Invalid or missing transaction data');
      }
    }

    // Sử dụng transaction để đảm bảo tính nhất quán dữ liệu
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3. Lưu giao dịch vào bảng Transactions
      const transaction = this.transactionRepository.create({
        accountId: transactionData.accountId,
        type: transactionData.type,
        itemDescription: transactionData.itemDescription,
        amount: transactionData.amount,
        transactionDate: new Date(transactionData.transactionDate),
        shopName: transactionData.shopName || null,
        paymentMethod: transactionData.paymentMethod || null,
      });

      const savedTransaction = await queryRunner.manager.save(Transaction, transaction);

      // 4. CẬP NHẬT SỐ DƯ
      // Nếu type là Expense, trừ amount khỏi balance
      // Nếu là Revenue, cộng amount
      if (transactionData.type === TransactionType.EXPENSE) {
        account.balance = Number(account.balance) - Number(transactionData.amount);
      } else if (transactionData.type === TransactionType.REVENUE) {
        account.balance = Number(account.balance) + Number(transactionData.amount);
      }

      await queryRunner.manager.save(Account, account);

      // 5. Nếu type = Expense, lưu vào bảng ExpenseDetails
      if (transactionData.type === TransactionType.EXPENSE && transactionData.categoryId) {
        const expenseDetail = this.expenseDetailRepository.create({
          transactionId: savedTransaction.transactionId,
          categoryId: transactionData.categoryId,
          subCategoryAmount: transactionData.amount,
        });

        await queryRunner.manager.save(ExpenseDetail, expenseDetail);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Invalid or missing transaction data');
    } finally {
      // Giải phóng query runner
      await queryRunner.release();
    }
  }
}

