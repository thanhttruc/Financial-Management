import { Controller, Get, Query, Request, UseGuards, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  /**
   * Lấy tổng hợp tiết kiệm theo năm (Revenue - Expense) và so sánh với năm trước
   * @param req Request object chứa thông tin user đã xác thực
   * @param year Năm cần lấy dữ liệu (query param)
   * @returns Object chứa success, message, data (this_year và last_year)
   */
  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getSavingSummary(
    @Request() req: any,
    @Query('year', ParseIntPipe) year: number,
  ) {
    const userId = req.user.userId;
    const summary = await this.savingsService.getSavingSummary(userId, year);

    return {
      success: true,
      message: 'Lấy tổng hợp tiết kiệm thành công',
      data: summary,
    };
  }
}

