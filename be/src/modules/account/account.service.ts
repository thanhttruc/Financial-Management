import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

/**
 * Service xử lý logic nghiệp vụ liên quan đến tài khoản ngân hàng
 */
@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Format số tài khoản thành dạng mask - chỉ mask 4 số cuối
   * Ví dụ: 9704221122334455667 -> 9704221122334455****
   * @param accountNumber - Số tài khoản đầy đủ
   * @returns Số tài khoản đã được mask (chỉ mask 4 số cuối)
   */
  private formatAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length === 0) {
      return '';
    }

    // Nếu số tài khoản có <= 4 chữ số, mask toàn bộ để bảo mật
    if (accountNumber.length <= 4) {
      return '*'.repeat(accountNumber.length);
    }

    // Chỉ mask 4 số cuối, phần còn lại hiển thị bình thường
    const visiblePart = accountNumber.substring(0, accountNumber.length - 4);
    const maskedPart = '****';
    
    return visiblePart + maskedPart;
  }

  /**
   * Lấy danh sách tài khoản của user
   * @param userId - ID của user
   * @returns Danh sách tài khoản với format response chuẩn
   */
  async getAccountsByUser(userId: number) {
    try {
      const accounts = await this.accountRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      // Format response theo đúng format yêu cầu
      const formattedAccounts = accounts.map((account) => {
        const fullAccountNumber = account.accountNumberFull || account.accountNumberLast4 || '';
        const maskedAccountNumber = fullAccountNumber ? this.formatAccountNumber(fullAccountNumber) : '';
        
        return {
          id: account.accountId,
          bank_name: account.bankName || '',
          account_type: account.accountType,
          branch_name: account.branchName || '',
          account_number: maskedAccountNumber,
          balance: parseFloat(account.balance.toString()),
        };
      });

      return {
        user_id: userId,
        accounts: formattedAccounts,
      };
    } catch (error) {
      console.error('[AccountService] Error fetching accounts:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể lấy danh sách tài khoản.',
      });
    }
  }

  /**
   * Tạo tài khoản mới cho user
   * @param userId - ID của user
   * @param createAccountDto - DTO chứa thông tin tài khoản
   * @returns Tài khoản vừa tạo
   */
  async createAccount(userId: number, createAccountDto: CreateAccountDto) {
    try {
      // Lấy 4 số cuối từ account_number_full
      const accountNumberFull = createAccountDto.account_number_full;
      const accountNumberLast4 = accountNumberFull.length >= 4 
        ? accountNumberFull.slice(-4) 
        : accountNumberFull;

      // Tạo entity mới
      const newAccount = this.accountRepository.create({
        userId,
        bankName: createAccountDto.bank_name,
        accountType: createAccountDto.account_type,
        branchName: createAccountDto.branch_name || null,
        accountNumberFull: accountNumberFull,
        accountNumberLast4: accountNumberLast4,
        balance: createAccountDto.balance,
      });

      // Lưu vào database
      const savedAccount = await this.accountRepository.save(newAccount);

      // Format số tài khoản với mask
      const fullAccountNumber = savedAccount.accountNumberFull || savedAccount.accountNumberLast4 || '';
      const maskedAccountNumber = fullAccountNumber ? this.formatAccountNumber(fullAccountNumber) : '';

      // Format response theo đúng format yêu cầu
      return {
        id: savedAccount.accountId,
        user_id: savedAccount.userId,
        bank_name: savedAccount.bankName || '',
        account_type: savedAccount.accountType,
        branch_name: savedAccount.branchName || '',
        account_number: maskedAccountNumber,
        balance: parseFloat(savedAccount.balance.toString()),
      };
    } catch (error) {
      console.error('[AccountService] Error creating account:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể tạo tài khoản mới.',
      });
    }
  }

  /**
   * Lấy chi tiết tài khoản theo ID kèm danh sách giao dịch (có pagination)
   * @param accountId - ID của tài khoản
   * @param userId - ID của user (để đảm bảo user chỉ xem tài khoản của mình)
   * @param limit - Số lượng giao dịch tối đa (mặc định 5)
   * @param offset - Vị trí bắt đầu (mặc định 0)
   * @returns Chi tiết tài khoản và danh sách giao dịch
   */
  async getAccountById(accountId: number, userId: number, limit: number = 5, offset: number = 0) {
    try {
      // Tìm tài khoản và kiểm tra quyền sở hữu
      const account = await this.accountRepository.findOne({
        where: { accountId, userId },
      });

      if (!account) {
        throw new NotFoundException({
          success: false,
          message: 'Tài khoản không tồn tại hoặc bạn không có quyền truy cập.',
        });
      }

      // Lấy tổng số giao dịch của tài khoản này
      const totalTransactions = await this.transactionRepository.count({
        where: { accountId },
      });

      // Lấy danh sách giao dịch với pagination
      const transactions = await this.transactionRepository.find({
        where: { accountId },
        order: { transactionDate: 'DESC' },
        skip: offset,
        take: limit,
      });

      // Format các giao dịch
      const formattedTransactions = transactions.map((transaction) => ({
        date: transaction.transactionDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        amount: parseFloat(transaction.amount.toString()) * (transaction.type === 'Expense' ? -1 : 1),
        description: transaction.itemDescription || transaction.shopName || 'Giao dịch',
      }));

      // Format response theo đúng format yêu cầu
      return {
        id: account.accountId,
        bank_name: account.bankName || '',
        account_type: account.accountType,
        branch_name: account.branchName || '',
        account_number_full: account.accountNumberFull || '',
        balance: parseFloat(account.balance.toString()),
        recent_transactions: formattedTransactions,
        total_transactions: totalTransactions,
        has_more: offset + transactions.length < totalTransactions,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('[AccountService] Error fetching account details:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể lấy chi tiết tài khoản.',
      });
    }
  }

  /**
   * Cập nhật thông tin tài khoản
   * @param accountId - ID của tài khoản
   * @param userId - ID của user (để đảm bảo user chỉ cập nhật tài khoản của mình)
   * @param updateAccountDto - DTO chứa thông tin cần cập nhật
   * @returns Tài khoản đã được cập nhật
   */
  async updateAccount(accountId: number, userId: number, updateAccountDto: UpdateAccountDto) {
    try {
      // Tìm tài khoản và kiểm tra quyền sở hữu
      const account = await this.accountRepository.findOne({
        where: { accountId, userId },
      });

      if (!account) {
        throw new NotFoundException({
          success: false,
          message: 'Tài khoản không tồn tại hoặc bạn không có quyền truy cập.',
        });
      }

      // Cập nhật các trường được cung cấp
      if (updateAccountDto.bank_name !== undefined) {
        account.bankName = updateAccountDto.bank_name;
      }

      if (updateAccountDto.account_type !== undefined) {
        account.accountType = updateAccountDto.account_type;
      }

      if (updateAccountDto.branch_name !== undefined) {
        account.branchName = updateAccountDto.branch_name;
      }

      if (updateAccountDto.account_number_full !== undefined) {
        const accountNumberFull = updateAccountDto.account_number_full;
        account.accountNumberFull = accountNumberFull;
        // Tự động cập nhật 4 số cuối
        account.accountNumberLast4 = accountNumberFull.length >= 4 
          ? accountNumberFull.slice(-4) 
          : accountNumberFull;
      }

      if (updateAccountDto.balance !== undefined) {
        account.balance = updateAccountDto.balance;
      }

      // Lưu thay đổi
      const updatedAccount = await this.accountRepository.save(account);

      // Format response theo đúng format yêu cầu
      return {
        account_id: updatedAccount.accountId,
        user_id: updatedAccount.userId,
        bank_name: updatedAccount.bankName || '',
        account_type: updatedAccount.accountType,
        branch_name: updatedAccount.branchName || '',
        account_number_full: updatedAccount.accountNumberFull || '',
        account_number_last_4: updatedAccount.accountNumberLast4 || '',
        balance: parseFloat(updatedAccount.balance.toString()),
        updated_at: updatedAccount.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('[AccountService] Error updating account:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể cập nhật thông tin tài khoản.',
      });
    }
  }

  /**
   * Xóa tài khoản (soft delete) và các transactions liên quan
   * @param accountId - ID của tài khoản
   * @param userId - ID của user (để đảm bảo user chỉ xóa tài khoản của mình)
   * @returns ID của tài khoản đã xóa
   */
  async deleteAccount(accountId: number, userId: number) {
    try {
      // Tìm tài khoản và kiểm tra quyền sở hữu (bao gồm cả các record đã bị soft delete)
      const account = await this.accountRepository.findOne({
        where: { accountId, userId },
        withDeleted: true, // Tìm cả record đã bị soft delete
      });

      if (!account) {
        throw new NotFoundException({
          success: false,
          message: 'Account not found or not owned by current user',
        });
      }

      // Kiểm tra xem account đã bị xóa chưa
      if (account.deletedAt) {
        throw new BadRequestException({
          success: false,
          message: 'Account has already been deleted',
        });
      }

      // Soft delete tất cả transactions liên quan
      const transactions = await this.transactionRepository.find({
        where: { accountId },
      });

      if (transactions.length > 0) {
        // Soft delete từng transaction
        for (const transaction of transactions) {
          await this.transactionRepository.softRemove(transaction);
        }
      }

      // Soft delete account
      await this.accountRepository.softRemove(account);

      return {
        deleted_account_id: accountId,
        deleted_transactions_count: transactions.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('[AccountService] Error deleting account:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Không thể xóa tài khoản.',
      });
    }
  }
}
