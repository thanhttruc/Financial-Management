import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { BillsService } from './bill.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  /**
   * Lấy danh sách hóa đơn sắp tới của user hiện tại
   * @param req Request object chứa thông tin user đã xác thực
   * @returns Object chứa success, message, data (danh sách hóa đơn)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUpcomingBills(@Request() req: any) {
    const userId = req.user.userId;
    const bills = await this.billsService.getUpcomingBills(userId);

    return {
      success: true,
      message: 'Lấy danh sách hóa đơn sắp tới thành công',
      data: bills,
    };
  }
}

