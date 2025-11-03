import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { ExpenseDetail } from '../expense-detail/entities/expense-detail.entity';
import { Account } from '../account/entities/account.entity';
import { GetTransactionsDto, TransactionFilterType } from './dto/get-transactions.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

/**
 * Service xử lý logic nghiệp vụ cho transactions
 */
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(ExpenseDetail)
    private expenseDetailRepository: Repository<ExpenseDetail>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private dataSource: DataSource,
  ) {}

  /**
   * Lấy danh sách giao dịch với phân trang và lọc theo type
   */
  async getTransactions(dto: GetTransactionsDto) {
    const { type = TransactionFilterType.ALL, userId, limit = 10, offset = 0 } = dto;
  
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoinAndSelect('transaction.account', 'account') // ✅ Phải dùng innerJoinAndSelect
      .orderBy('transaction.transactionDate', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC');
  
    // ✅ Lọc theo userId trước
    if (userId) {
      queryBuilder.andWhere('account.userId = :userId', { userId });
    }
  
    // ✅ Lọc theo type
    if (type === TransactionFilterType.REVENUE) {
      queryBuilder.andWhere('transaction.type = :type', { type: TransactionType.REVENUE });
    } else if (type === TransactionFilterType.EXPENSE) {
      queryBuilder.andWhere('transaction.type = :type', { type: TransactionType.EXPENSE });
    }
  
    // ✅ Phân trang và tổng số
    const total = await queryBuilder.getCount();
    const transactions = await queryBuilder.skip(offset).take(limit).getMany();
  
    return {
      data: transactions.map((t) => {
        // Format date để chỉ trả về date part (YYYY-MM-DD) rồi thêm time UTC midnight
        // Đảm bảo hiển thị đúng ngày mà không bị ảnh hưởng bởi timezone
        const date = new Date(t.transactionDate);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const transactionDateFormatted = `${year}-${month}-${day}T00:00:00.000Z`;

        return {
          transactionId: t.transactionId,
          accountId: t.accountId,
          transactionDate: transactionDateFormatted,
          type: t.type,
          itemDescription: t.itemDescription,
          shopName: t.shopName,
          amount: parseFloat(t.amount.toString()),
          paymentMethod: t.paymentMethod,
          status: t.status,
          receiptId: t.receiptId,
          createdAt: t.createdAt.toISOString(),
        };
      }),
      total,
      hasMore: offset + limit < total,
    };
  }
  

  /**
   * Tạo giao dịch mới
   * Nếu type = Expense, tự động tạo ExpenseDetail với category
   */
  async createTransaction(dto: CreateTransactionDto) {
    // Validate expense detail fields nếu type = Expense
    if (dto.type === TransactionType.EXPENSE) {
      if (!dto.categoryId || !dto.subCategoryAmount) {
        throw new BadRequestException({
          success: false,
          message: 'categoryId và subCategoryAmount là bắt buộc khi tạo giao dịch chi tiêu (Expense).',
        });
      }
    }

    // Sử dụng transaction để đảm bảo atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Parse transactionDate từ ISO string, đảm bảo giữ nguyên ngày tháng
      // Nếu nhận "2024-11-01T00:00:00.000Z", tạo date object giữ nguyên ngày 1/11
      let transactionDate: Date;
      if (dto.transactionDate.includes('T')) {
        // Parse ISO string và tạo date ở UTC để giữ nguyên ngày tháng
        const dateStr = dto.transactionDate.split('T')[0]; // "2024-11-01"
        const [year, month, day] = dateStr.split('-').map(Number);
        transactionDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      } else {
        // Fallback nếu không có format ISO
        transactionDate = new Date(dto.transactionDate);
      }

      // Tạo Transaction
      const transactionEntity = queryRunner.manager.create(Transaction, {
        accountId: dto.accountId,
        transactionDate: transactionDate,
        type: dto.type,
        itemDescription: dto.itemDescription,
        shopName: dto.shopName ?? null,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod ?? null,
        status: dto.status ?? undefined,
      });

      const savedTransaction = await queryRunner.manager.save(Transaction, transactionEntity);

      // Nếu type = Expense, tạo ExpenseDetail
      if (dto.type === TransactionType.EXPENSE && dto.categoryId && dto.subCategoryAmount) {
        const expenseDetailEntity = queryRunner.manager.create(ExpenseDetail, {
          transactionId: savedTransaction.transactionId,
          categoryId: dto.categoryId,
          subCategoryName: dto.subCategoryName ?? null,
          subCategoryAmount: dto.subCategoryAmount,
        });

        await queryRunner.manager.save(ExpenseDetail, expenseDetailEntity);
      }

      // Cập nhật số dư tài khoản dựa trên loại giao dịch
      const account = await queryRunner.manager.findOne(Account, {
        where: { accountId: dto.accountId },
      });

      if (!account) {
        throw new NotFoundException({
          success: false,
          message: 'Tài khoản không tồn tại.',
        });
      }

      // Tính số dư mới
      const currentBalance = parseFloat(account.balance.toString());
      let newBalance: number;

      if (dto.type === TransactionType.EXPENSE) {
        // Chi tiêu: trừ số dư
        newBalance = currentBalance - dto.amount;
      } else if (dto.type === TransactionType.REVENUE) {
        // Thu nhập: cộng số dư
        newBalance = currentBalance + dto.amount;
      } else {
        throw new BadRequestException({
          success: false,
          message: 'Loại giao dịch không hợp lệ.',
        });
      }

      // Kiểm tra số dư không được âm (nếu là Expense)
      if (dto.type === TransactionType.EXPENSE && newBalance < 0) {
        throw new BadRequestException({
          success: false,
          message: 'Số dư tài khoản không đủ để thực hiện giao dịch này.',
        });
      }

      // Cập nhật số dư tài khoản
      account.balance = newBalance;
      await queryRunner.manager.save(Account, account);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Format date để chỉ trả về date part (YYYY-MM-DD) rồi thêm time UTC midnight
      const date = new Date(savedTransaction.transactionDate);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const transactionDateFormatted = `${year}-${month}-${day}T00:00:00.000Z`;

      return {
        success: true,
        message: 'Transaction created successfully',
        data: {
          transactionId: savedTransaction.transactionId,
          accountId: savedTransaction.accountId,
          transactionDate: transactionDateFormatted,
          type: savedTransaction.type,
          itemDescription: savedTransaction.itemDescription,
          shopName: savedTransaction.shopName,
          amount: parseFloat(savedTransaction.amount.toString()),
          paymentMethod: savedTransaction.paymentMethod,
          status: savedTransaction.status,
          receiptId: savedTransaction.receiptId,
          createdAt: savedTransaction.createdAt.toISOString(),
        },
      };
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      console.error('❌ Lỗi khi tạo transaction:', error);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}

