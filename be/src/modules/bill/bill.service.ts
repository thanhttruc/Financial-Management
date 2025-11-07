import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Bill } from './entities/bill.entity';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
  ) {}

  /**
   * Lấy danh sách hóa đơn sắp tới của user
   * @param userId ID của user (từ token đã xác thực)
   * @returns Danh sách hóa đơn sắp tới, sắp xếp theo dueDate tăng dần
   */
  async getUpcomingBills(userId: number): Promise<Bill[]> {
    // 1. Kiểm tra bảo mật: Chỉ lấy hóa đơn thuộc về userId hiện tại
    // 2. Sắp xếp: Sắp xếp danh sách hóa đơn theo dueDate TĂNG DẦN (sắp đến hạn)
    // 3. Lọc: Chỉ lấy những hóa đơn có dueDate trong tương lai
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh chính xác

    const bills = await this.billRepository.find({
      where: {
        userId,
        dueDate: MoreThan(today), // Chỉ lấy hóa đơn có dueDate > today
      },
      order: {
        dueDate: 'ASC', // Sắp xếp theo dueDate tăng dần
      },
    });

    return bills;
  }
}

