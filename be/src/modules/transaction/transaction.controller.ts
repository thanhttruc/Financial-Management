import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
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
   * Lọc theo userId (qua quan hệ Account -> User), không phải accountId
   */
  @UseGuards(AuthGuard('jwt'))
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
    name: 'userId',
    required: false,
    type: Number,
    description: 'Lọc theo userId của chủ tài khoản (qua bảng Accounts). Ưu tiên lấy từ JWT token.',
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
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  async getTransactions(@Request() req, @Query() query: GetTransactionsDto) {
    // Validate type parameter
    if (query.type && !Object.values(TransactionFilterType).includes(query.type)) {
      throw new BadRequestException({ message: 'Invalid type parameter' });
    }

    // Ưu tiên lấy userId từ JWT token, fallback về query param
    const userIdFromJwt = req.user?.userId as number | undefined;
    const userId = userIdFromJwt ?? query.userId;

    console.log('[TransactionController] getTransactions:', {
      userId,
      userIdFromJwt,
      userIdFromQuery: query.userId,
      hasJwtUser: !!req.user,
    });

    // Tạo DTO với userId đã được xác định
    const dtoWithUserId = {
      ...query,
      userId,
    };

    const result = await this.transactionService.getTransactions(dtoWithUserId);
    return result;
  }

  /**
   * Tạo một giao dịch mới
   * POST /api/v1/transactions
   * accountId trong DTO là ID của tài khoản ngân hàng (Account), không phải userId
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo giao dịch mới' })
  @ApiResponse({ status: 201, description: 'Tạo mới thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  async createTransaction(@Request() req, @Body() body: CreateTransactionDto) {
    // Log để debug (có thể xóa sau)
    const userIdFromJwt = req.user?.userId as number | undefined;
    console.log('[TransactionController] createTransaction:', {
      accountId: body.accountId,
      userIdFromJwt,
      hasJwtUser: !!req.user,
    });

    // Validate accountId thuộc về user hiện tại (optional - có thể thêm validation sau)
    // accountId là ID của Account (tài khoản ngân hàng), không phải userId

    return this.transactionService.createTransaction(body);
  }
}

