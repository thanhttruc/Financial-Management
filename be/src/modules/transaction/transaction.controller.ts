import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { GetTransactionsDto, TransactionFilterType } from './dto/get-transactions.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

/**
 * Controller xử lý các API liên quan đến transactions
 */
@ApiTags('transactions')
@Controller('v1/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Lấy danh sách giao dịch
   * GET /api/v1/transactions
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách giao dịch' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TransactionFilterType,
    description: 'Loại giao dịch: All, Revenue, hoặc Expense',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng bản ghi mỗi lần lấy (mặc định 10)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Vị trí bắt đầu (phục vụ phân trang), mặc định 0',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async getTransactions(@Query() query: GetTransactionsDto) {
    // Validate type parameter
    if (query.type && !Object.values(TransactionFilterType).includes(query.type)) {
      throw new BadRequestException({ message: 'Invalid type parameter' });
    }

    const result = await this.transactionService.getTransactions(query);
    return result;
  }

  /**
   * Tạo một giao dịch mới
   * POST /api/v1/transactions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo giao dịch mới' })
  @ApiResponse({ status: 201, description: 'Tạo mới thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async createTransaction(@Body() body: CreateTransactionDto) {
    return this.transactionService.createTransaction(body);
  }
}

