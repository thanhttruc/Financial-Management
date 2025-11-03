import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

/**
 * Controller xử lý các API liên quan đến tài khoản ngân hàng
 */
@ApiTags('accounts')
@Controller('v1/accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * Lấy danh sách tài khoản của user đăng nhập
   * GET /api/v1/accounts
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tài khoản ngân hàng của user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lấy danh sách thành công',
    schema: {
      example: {
        user_id: 1,
        accounts: [
          {
            id: 1,
            bank_name: 'Vietcombank',
            account_type: 'Checking',
            branch_name: 'Quận 1',
            account_number: '970422123456789****',
            balance: 4000000,
          },
          {
            id: 2,
            bank_name: 'Techcombank',
            account_type: 'Savings',
            branch_name: 'Quận 3',
            account_number: '0987654321234****',
            balance: 4000000,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
  async getAccounts(@Request() req) {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new Error('User ID not found in token');
    }

    console.log('[AccountController] getAccounts - userId:', userId);
    
    const result = await this.accountService.getAccountsByUser(userId);
    
    return {
      success: true,
      message: 'Fetched successfully',
      data: result,
    };
  }

  /**
   * Tạo tài khoản mới cho user đăng nhập
   * POST /api/v1/accounts
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo tài khoản ngân hàng mới cho user' })
  @ApiResponse({
    status: 201,
    description: 'Tạo tài khoản thành công',
    schema: {
      example: {
        success: true,
        message: 'Account created successfully',
        data: {
          id: 9,
          user_id: 1,
          bank_name: 'TPBank',
          account_type: 'Checking',
          branch_name: 'Quận 4',
          account_number: '970422112233445****',
          balance: 2500000,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
  async createAccount(@Request() req, @Body() createAccountDto: CreateAccountDto) {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new Error('User ID not found in token');
    }

    console.log('[AccountController] createAccount - userId:', userId);
    
    const account = await this.accountService.createAccount(userId, createAccountDto);
    
    return {
      success: true,
      message: 'Account created successfully',
      data: account,
    };
  }

  /**
   * Lấy chi tiết tài khoản theo ID
   * GET /api/v1/accounts/:id
   */
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'ID của tài khoản' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng giao dịch tối đa (mặc định 5)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Vị trí bắt đầu (mặc định 0)' })
  @ApiOperation({ summary: 'Lấy chi tiết tài khoản ngân hàng' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết tài khoản thành công',
    schema: {
      example: {
        success: true,
        message: 'Fetched successfully',
        data: {
          id: 1,
          bank_name: 'Vietcombank',
          account_type: 'Checking',
          branch_name: 'Quận 1',
          account_number_full: '9704221234567890123',
          balance: 5200000,
          recent_transactions: [
            {
              date: '2025-10-31',
              amount: -500000,
              description: 'Siêu thị Co.opmart',
            },
            {
              date: '2025-10-30',
              amount: 1000000,
              description: 'Chuyển từ Momo',
            },
          ],
          total_transactions: 10,
          has_more: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  @ApiResponse({ status: 404, description: 'Not Found - tài khoản không tồn tại hoặc không thuộc user' })
  @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
  async getAccountById(
    @Param('id', ParseIntPipe) accountId: number,
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new Error('User ID not found in token');
    }

    const transactionLimit = limit ? Number(limit) : 5;
    const transactionOffset = offset ? Number(offset) : 0;

    console.log('[AccountController] getAccountById - accountId:', accountId, 'userId:', userId, 'limit:', transactionLimit, 'offset:', transactionOffset);
    
    const account = await this.accountService.getAccountById(accountId, userId, transactionLimit, transactionOffset);
    
    return {
      success: true,
      message: 'Fetched successfully',
      data: account,
    };
  }

  /**
   * Cập nhật thông tin tài khoản
   * PUT /api/v1/accounts/:id
   */
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'ID của tài khoản' })
  @ApiOperation({ summary: 'Cập nhật thông tin tài khoản' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông tin tài khoản thành công',
    schema: {
      example: {
        success: true,
        message: 'Account updated successfully',
        data: {
          account_id: 1,
          user_id: 1,
          bank_name: 'Vietcombank',
          account_type: 'Checking',
          branch_name: 'Quận 3',
          account_number_full: '9704221234567890123',
          account_number_last_4: '0123',
          balance: 4500000,
          updated_at: '2025-11-01T15:25:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  @ApiResponse({ status: 404, description: 'Not Found - tài khoản không tồn tại hoặc không thuộc user' })
  @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
  async updateAccount(
    @Param('id', ParseIntPipe) accountId: number,
    @Request() req,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new Error('User ID not found in token');
    }

    console.log('[AccountController] updateAccount - accountId:', accountId, 'userId:', userId);
    
    const account = await this.accountService.updateAccount(accountId, userId, updateAccountDto);
    
    return {
      success: true,
      message: 'Account updated successfully',
      data: account,
    };
  }

  /**
   * Xóa tài khoản
   * DELETE /api/v1/accounts/:id
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'ID của tài khoản' })
  @ApiOperation({ summary: 'Xóa tài khoản ngân hàng' })
  @ApiResponse({
    status: 200,
    description: 'Xóa tài khoản thành công (soft delete)',
    schema: {
      example: {
        success: true,
        message: 'Account deleted successfully',
        data: {
          deleted_account_id: 1,
          deleted_transactions_count: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - tài khoản có giao dịch liên quan' })
  @ApiResponse({ status: 401, description: 'Unauthorized - thiếu JWT token' })
  @ApiResponse({ status: 404, description: 'Not Found - tài khoản không tồn tại hoặc không thuộc user' })
  @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
  async deleteAccount(
    @Param('id', ParseIntPipe) accountId: number,
    @Request() req,
  ) {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new Error('User ID not found in token');
    }

    console.log('[AccountController] deleteAccount - accountId:', accountId, 'userId:', userId);
    
    const result = await this.accountService.deleteAccount(accountId, userId);
    
    return {
      success: true,
      message: 'Account deleted successfully',
      data: {
        deleted_account_id: result.deleted_account_id,
        deleted_transactions_count: result.deleted_transactions_count || 0,
      },
    };
  }
}
