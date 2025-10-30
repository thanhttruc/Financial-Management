import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
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
  ) {}

  /**
   * Lấy danh sách giao dịch với phân trang và lọc theo type
   */
  async getTransactions(dto: GetTransactionsDto) {
    const { type = TransactionFilterType.ALL, limit = 10, offset = 0 } = dto;

    // Tạo query builder
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .orderBy('transaction.transactionDate', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC');

    // Lọc theo type
    if (type === TransactionFilterType.REVENUE) {
      queryBuilder.where('transaction.type = :type', { type: TransactionType.REVENUE });
    } else if (type === TransactionFilterType.EXPENSE) {
      queryBuilder.where('transaction.type = :type', { type: TransactionType.EXPENSE });
    }
    // Nếu type = 'All' hoặc không có, không thêm điều kiện where

    // Phân trang
    const total = await queryBuilder.getCount();
    const transactions = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();

    // Format response theo đúng yêu cầu
    return {
      data: transactions.map((t) => ({
        transactionId: t.transactionId,
        accountId: t.accountId,
        transactionDate: t.transactionDate.toISOString(),
        type: t.type,
        itemDescription: t.itemDescription,
        shopName: t.shopName,
        amount: parseFloat(t.amount.toString()),
        paymentMethod: t.paymentMethod,
        status: t.status,
        receiptId: t.receiptId,
        createdAt: t.createdAt.toISOString(),
      })),
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Tạo giao dịch mới
   */
  async createTransaction(dto: CreateTransactionDto) {
    const entity = this.transactionRepository.create({
      accountId: dto.accountId,
      transactionDate: new Date(dto.transactionDate),
      type: dto.type,
      itemDescription: dto.itemDescription,
      shopName: dto.shopName ?? null,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod ?? null,
      status: dto.status ?? undefined,
    });

    const saved = await this.transactionRepository.save(entity);

    return {
      success: true,
      message: 'Transaction created successfully',
      data: {
        transactionId: saved.transactionId,
        accountId: saved.accountId,
        transactionDate: saved.transactionDate.toISOString(),
        type: saved.type,
        itemDescription: saved.itemDescription,
        shopName: saved.shopName,
        amount: parseFloat(saved.amount.toString()),
        paymentMethod: saved.paymentMethod,
        status: saved.status,
        receiptId: saved.receiptId,
        createdAt: saved.createdAt.toISOString(),
      },
    };
  }
}

