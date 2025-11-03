import { Body, Controller, Get, HttpCode, HttpStatus, InternalServerErrorException, Post, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BillService } from './bill.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateBillDto } from './dto/create-bill.dto';

@ApiTags('bills')
@Controller('v1/bills')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách hóa đơn theo user đăng nhập' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 500, description: 'Lỗi máy chủ' })
  async getBillsByUser(@Request() req) {
    try {
      console.log('🔐 User info from JWT payload:', req.user);

      const userId = req.user.userId; // 👈 Lấy từ payload JWT
      return await this.billService.getBillsByUser(userId);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        message: 'Failed to fetch bills',
      });
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo mới hóa đơn' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Thiếu hoặc dữ liệu không hợp lệ' })
  async createBill(@Request() req, @Body() body: CreateBillDto) {
    try {
      const userId = req.user?.userId;
      const result = await this.billService.createBill(body, userId);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException({ message: 'Failed to create bill' });
    }
  }
  
}