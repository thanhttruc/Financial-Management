import { Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Query, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { AuthGuard } from '@nestjs/passport';

/**
 * Controller cung cấp API tổng hợp chi tiêu theo tháng
 */
@ApiTags('expenses')
@Controller('v1/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  /**
   * GET /api/v1/expenses/summary?userId={user_id}
   * Trả về tổng chi tiêu theo tháng (Transactions.type = 'Expense')
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tổng chi tiêu theo tháng' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @ApiResponse({ status: 500, description: 'Không thể lấy dữ liệu chi tiêu.' })
  async getMonthlyExpenseSummary(@Request() req, @Query('userId') userIdParam?: string) {
    // Ưu tiên lấy userId từ JWT (an toàn hơn)
    const userIdFromJwt = req.user?.userId as number | undefined;
    const userId = userIdFromJwt ?? (userIdParam ? Number(userIdParam) : undefined);
    
    console.log('[ExpensesController] getMonthlyExpenseSummary:', {
      userId,
      userIdFromJwt,
      userIdParam,
      hasJwtUser: !!req.user,
    });
    
    if (!userId || Number.isNaN(userId)) {
      throw new InternalServerErrorException({ 
        success: false, 
        message: 'Thiếu userId hợp lệ. Vui lòng đăng nhập lại.' 
      });
    }
    
    try {
      const data = await this.expensesService.getMonthlyExpenseSummary(userId);
      return { success: true, message: 'OK', data };
    } catch (error) {
      console.error('[ExpensesController] Error:', error);
      throw new InternalServerErrorException({ 
        success: false, 
        message: 'Không thể lấy dữ liệu chi tiêu.' 
      });
    }
  }

  /**
   * GET /api/v1/expenses/breakdown?userId={user_id}&month=2025-05
   * Trả về chi tiết chi tiêu theo danh mục (Expense Breakdown)
   */
   @UseGuards(AuthGuard('jwt'))
  @Get('breakdown')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chi tiết chi tiêu theo danh mục' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @ApiResponse({ status: 404, description: 'Không có dữ liệu chi tiêu cho tháng này.' })
  @ApiResponse({ status: 500, description: 'Không thể lấy dữ liệu chi tiết chi tiêu.' })
  async getExpenseBreakdown(@Request() req, @Query('userId') userIdParam?: string, @Query('month') month?: string) {
    // Ưu tiên lấy userId từ JWT (an toàn hơn)
    const userIdFromJwt = req.user?.userId as number | undefined;
    const userId = userIdFromJwt ?? (userIdParam ? Number(userIdParam) : undefined);
    
    console.log('[ExpensesController] getExpenseBreakdown:', {
      userId,
      userIdFromJwt,
      userIdParam,
      month,
      hasJwtUser: !!req.user,
    });
    
    if (!userId || Number.isNaN(userId)) {
      throw new InternalServerErrorException({ 
        success: false, 
        message: 'Thiếu userId hợp lệ. Vui lòng đăng nhập lại.' 
      });
    }
    
    try {
      const data = await this.expensesService.getExpenseBreakdown(userId, month);
      return { success: true, message: 'OK', data };
    } catch (error) {
      console.error('[ExpensesController] Error:', error);
      // Nếu là NotFoundException thì throw lại với status 404
      if (error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException({ 
        success: false, 
        message: 'Không thể lấy dữ liệu chi tiết chi tiêu.' 
      });
    }
  }
}


