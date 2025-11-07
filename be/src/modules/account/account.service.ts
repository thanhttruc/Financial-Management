import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Transaction, TransactionType } from '../transaction/entities/transaction.entity';
import { ExpenseDetail } from '../expense-detail/entities/expense-detail.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(ExpenseDetail)
    private readonly expenseDetailRepository: Repository<ExpenseDetail>,
  ) {}

  /**
   * Lấy tất cả tài khoản của một user
   * @param userId ID của user
   * @returns Danh sách các tài khoản của user
   */
  async findAllByUserId(userId: number): Promise<Account[]> {
    return await this.accountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy chi tiết tài khoản kèm 5 giao dịch gần nhất
   * @param userId ID của user (từ token)
   * @param accountId ID của tài khoản
   * @returns Chi tiết tài khoản và giao dịch gần nhất
   * @throws ForbiddenException nếu tài khoản không tồn tại hoặc không thuộc về user
   */
  async getDetails(userId: number, accountId: number) {
    // Tìm tài khoản và đảm bảo nó thuộc về user
    const account = await this.accountRepository.findOne({
      where: { accountId, userId },
    });

    if (!account) {
      throw new ForbiddenException('Tài khoản không tồn tại hoặc không thuộc về người dùng');
    }

    // Lấy 5 giao dịch gần nhất, sắp xếp theo ngày giảm dần
    const transactions = await this.transactionRepository.find({
      where: { accountId },
      order: { transactionDate: 'DESC' },
      take: 5,
    });

    // Format transactions theo response mẫu
    const recentTransactions = transactions.map((transaction) => {
      // Format date thành YYYY-MM-DD
      const date = new Date(transaction.transactionDate);
      const formattedDate = date.toISOString().split('T')[0];

      // Amount: âm cho Expense, dương cho Revenue
      const amount =
        transaction.type === TransactionType.EXPENSE
          ? -Math.abs(Number(transaction.amount))
          : Math.abs(Number(transaction.amount));

      return {
        date: formattedDate,
        amount,
        description: transaction.itemDescription,
      };
    });

    // Format response theo mẫu
    return {
      id: account.accountId,
      bank_name: account.bankName,
      account_type: account.accountType,
      branch_name: account.branchName,
      account_number_full: account.accountNumberFull,
      balance: Number(account.balance),
      recent_transactions: recentTransactions,
    };
  }

  /**
   * Tạo tài khoản mới
   * @param userId ID của user (từ token đã xác thực)
   * @param createAccountDto DTO chứa thông tin tài khoản mới
   * @returns Tài khoản vừa được tạo
   * @throws BadRequestException nếu balance < 0 hoặc account_number_full không hợp lệ
   */
  async createAccount(userId: number, createAccountDto: CreateAccountDto): Promise<Account> {
    // 1. Kiểm tra balance phải >= 0 (Rule nghiệp vụ)
    if (createAccountDto.balance < 0) {
      throw new BadRequestException('Số dư khởi tạo phải lớn hơn hoặc bằng 0');
    }

    // 2. Tạo account_number_last_4 từ account_number_full (lấy 4 ký tự cuối)
    let accountNumberLast4: string | null = null;
    if (createAccountDto.accountNumberFull && createAccountDto.accountNumberFull.length >= 4) {
      accountNumberLast4 = createAccountDto.accountNumberFull.slice(-4);
    } else if (createAccountDto.accountNumberFull) {
      // Nếu số tài khoản có ít hơn 4 ký tự, lấy tất cả
      accountNumberLast4 = createAccountDto.accountNumberFull;
    }

    // 3. Tạo tài khoản mới và gán user_id
    const newAccount = this.accountRepository.create({
      userId,
      bankName: createAccountDto.bankName,
      accountType: createAccountDto.accountType,
      branchName: createAccountDto.branchName || null,
      accountNumberFull: createAccountDto.accountNumberFull,
      accountNumberLast4,
      balance: createAccountDto.balance,
    });

    // 4. Lưu vào database
    const savedAccount = await this.accountRepository.save(newAccount);

    return savedAccount;
  }

  /**
   * Cập nhật thông tin tài khoản
   * @param userId ID của user (từ token đã xác thực)
   * @param accountId ID của tài khoản cần cập nhật
   * @param updateData DTO chứa thông tin cập nhật
   * @returns Tài khoản đã được cập nhật
   * @throws NotFoundException nếu tài khoản không tồn tại hoặc không thuộc về user
   * @throws ForbiddenException nếu tài khoản không thuộc về user
   * @throws BadRequestException nếu balance < 0 hoặc dữ liệu không hợp lệ
   */
  async updateAccount(userId: number, accountId: number, updateData: UpdateAccountDto): Promise<Account> {
    // 1. Kiểm tra bảo mật: Đảm bảo account_id tồn tại và thuộc về userId hiện tại
    const account = await this.accountRepository.findOne({
      where: { accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại hoặc không thuộc về người dùng hiện tại');
    }

    // 2. Kiểm tra validation: Đảm bảo balance >= 0 nếu được gửi
    if (updateData.balance !== undefined && updateData.balance < 0) {
      throw new BadRequestException('Số dư phải lớn hơn hoặc bằng 0');
    }

    // 3. Nếu account_number_full được gửi, tính toán lại và lưu account_number_last_4
    let accountNumberLast4: string | null = null;
    if (updateData.accountNumberFull !== undefined) {
      if (updateData.accountNumberFull.length >= 4) {
        accountNumberLast4 = updateData.accountNumberFull.slice(-4);
      } else if (updateData.accountNumberFull.length > 0) {
        // Nếu số tài khoản có ít hơn 4 ký tự, lấy tất cả
        accountNumberLast4 = updateData.accountNumberFull;
      }
    }

    // 4. Cập nhật các trường được gửi lên
    if (updateData.bankName !== undefined) {
      account.bankName = updateData.bankName;
    }
    if (updateData.accountType !== undefined) {
      account.accountType = updateData.accountType;
    }
    if (updateData.branchName !== undefined) {
      account.branchName = updateData.branchName || null;
    }
    if (updateData.accountNumberFull !== undefined) {
      account.accountNumberFull = updateData.accountNumberFull;
      account.accountNumberLast4 = accountNumberLast4;
    }
    if (updateData.balance !== undefined) {
      account.balance = updateData.balance;
    }

    // 5. Lưu vào database
    const updatedAccount = await this.accountRepository.save(account);

    return updatedAccount;
  }

  /**
   * Xóa tài khoản và tất cả dữ liệu liên quan
   * @param userId ID của user (từ token đã xác thực)
   * @param accountId ID của tài khoản cần xóa
   * @throws NotFoundException nếu tài khoản không tồn tại hoặc không thuộc về user
   */
  async deleteAccount(userId: number, accountId: number): Promise<void> {
    // 1. Kiểm tra bảo mật: Đảm bảo account_id tồn tại và thuộc về userId hiện tại
    const account = await this.accountRepository.findOne({
      where: { accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found or not owned by current user');
    }

    // 2. XÓA DỮ LIỆU LIÊN QUAN: Tìm tất cả Transactions của account này
    const transactions = await this.transactionRepository.find({
      where: { accountId },
    });

    // Xóa tất cả ExpenseDetails liên quan đến các Transactions này
    if (transactions.length > 0) {
      const transactionIds = transactions.map((t) => t.transactionId);
      await this.expenseDetailRepository
        .createQueryBuilder()
        .delete()
        .where('transaction_id IN (:...ids)', { ids: transactionIds })
        .execute();
    }

    // 3. Xóa tất cả Transactions
    await this.transactionRepository.delete({ accountId });

    // 4. Xóa Tài khoản
    await this.accountRepository.delete({ accountId });
  }
}

