import { Controller, Get, Post, Put, Request, UseGuards, Param, Body, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { AccountsService } from './account.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('api/v1/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  /**
   * Lấy tất cả tài khoản của user hiện tại
   * @param req Request object chứa thông tin user đã xác thực
   * @returns Object chứa success, message, data (danh sách tài khoản)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    const userId = req.user.userId;
    const accounts = await this.accountsService.findAllByUserId(userId);

    return {
      success: true,
      message: 'Lấy danh sách tài khoản thành công',
      data: accounts,
    };
  }

  /**
   * Tạo tài khoản mới
   * @param req Request object chứa thông tin user đã xác thực
   * @param createAccountDto DTO chứa thông tin tài khoản mới
   * @returns Object chứa success, message, data (tài khoản vừa tạo)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createAccountDto: CreateAccountDto) {
    const userId = req.user.userId;
    const account = await this.accountsService.createAccount(userId, createAccountDto);

    return {
      success: true,
      message: 'Tạo tài khoản thành công',
      data: account,
    };
  }

  /**
   * Lấy chi tiết tài khoản kèm 5 giao dịch gần nhất
   * @param id ID của tài khoản
   * @param req Request object chứa thông tin user đã xác thực
   * @returns Chi tiết tài khoản và giao dịch gần nhất
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    const accountId = parseInt(id, 10);
    const accountDetails = await this.accountsService.getDetails(userId, accountId);

    return accountDetails;
  }

  /**
   * Cập nhật thông tin tài khoản
   * @param id ID của tài khoản cần cập nhật
   * @param req Request object chứa thông tin user đã xác thực
   * @param updateAccountDto DTO chứa thông tin cập nhật
   * @returns Object chứa success, message, data (tài khoản đã cập nhật)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Request() req: any, @Body() updateAccountDto: UpdateAccountDto) {
    const userId = req.user.userId;
    const accountId = parseInt(id, 10);
    const updatedAccount = await this.accountsService.updateAccount(userId, accountId, updateAccountDto);

    return {
      success: true,
      message: 'Cập nhật tài khoản thành công',
      data: updatedAccount,
    };
  }

  /**
   * Xóa tài khoản và tất cả dữ liệu liên quan
   * @param id ID của tài khoản cần xóa
   * @param req Request object chứa thông tin user đã xác thực
   * @returns Object chứa success, message
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId;
    const accountId = parseInt(id, 10);
    await this.accountsService.deleteAccount(userId, accountId);

    return {
      success: true,
      message: 'Xóa tài khoản thành công',
    };
  }
}

