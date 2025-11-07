import { Controller, Get, Request, UseGuards, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /**
   * Lấy tổng chi tiêu theo tháng của user hiện tại
   * @param req Request object chứa thông tin user đã xác thực
   * @returns Object chứa success, message, data (mảng monthly expense summary)
   */
  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getMonthlyExpenseSummary(@Request() req: any) {
    const userId = req.user.userId;
    const summary = await this.expensesService.getMonthlyExpenseSummary(userId);

    return {
      success: true,
      message: 'Lấy tổng chi tiêu theo tháng thành công',
      data: summary,
    };
  }

  /**
   * Lấy breakdown chi tiêu theo danh mục cho tháng được chỉ định
   * @param req Request object chứa thông tin user đã xác thực
   * @param month Tháng cần lấy breakdown (format: YYYY-MM)
   * @returns Object chứa success, message, data (mảng breakdown items)
   */
  @Get('breakdown')
  @UseGuards(JwtAuthGuard)
  async getExpenseBreakdown(@Request() req: any, @Query('month') month: string) {
    const userId = req.user.userId;
    const breakdown = await this.expensesService.getExpenseBreakdown(userId, month);

    return {
      success: true,
      message: 'Lấy breakdown chi tiêu thành công',
      data: breakdown,
    };
  }
}

