import { Controller, Get, Post, Query, Request, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('api/v1/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Lấy danh sách giao dịch với phân trang và lọc
   * @param req Request object chứa thông tin user đã xác thực
   * @param queryParams Query parameters: type, limit, offset
   * @returns Object chứa success, message, data (bao gồm data, total, hasMore)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getTransactions(@Request() req: any, @Query() queryParams: GetTransactionsQueryDto) {
    const userId = req.user.userId;
    const result = await this.transactionsService.getTransactions(userId, queryParams);

    return {
      success: true,
      message: 'Lấy danh sách giao dịch thành công',
      data: {
        data: result.data,
        total: result.total,
        hasMore: result.hasMore,
      },
    };
  }

  /**
   * Tạo giao dịch mới
   * @param req Request object chứa thông tin user đã xác thực
   * @param createTransactionDto Dữ liệu giao dịch cần tạo
   * @returns Object chứa success, message, data (transaction đã tạo)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(@Request() req: any, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.userId;
    const transaction = await this.transactionsService.createTransaction(userId, createTransactionDto);

    return {
      success: true,
      message: 'Tạo giao dịch thành công',
      data: transaction,
    };
  }
}

