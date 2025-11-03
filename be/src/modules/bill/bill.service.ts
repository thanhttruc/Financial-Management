import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { CreateBillDto } from './dto/create-bill.dto';


@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
  ) {}

  /**
   * Lấy danh sách hóa đơn của user (bao gồm cả đã đến hạn hoặc chưa)
   */
  async getBillsByUser(userId: number) {
    const bills = await this.billRepository.find({
      where: { userId },
      order: { dueDate: 'ASC' },
    });

    return {
      data: bills.map((b) => {
        const dueDate = ((): string => {
          const d: any = b.dueDate as any;
          if (!d) return null as any;
          return typeof d === 'string' ? d : d.toISOString().split('T')[0];
        })();

        const lastChargeDate = ((): string | null => {
          const d: any = b.lastChargeDate as any;
          if (!d) return null;
          return typeof d === 'string' ? d : d.toISOString().split('T')[0];
        })();

        return {
          billId: b.billId,
          userId: b.userId,
          itemDescription: b.itemDescription,
          logoUrl: b.logoUrl,
          dueDate,
          lastChargeDate,
          amount: parseFloat((b.amount as unknown as any).toString()),
          createdAt: (b.createdAt as Date).toISOString(),
          updatedAt: (b.updatedAt as Date).toISOString(),
        };
      }),
    };
  }

  /**
   * Tạo mới một hóa đơn cho user
   */
  async createBill(input: CreateBillDto, userIdFromAuth?: number) {
    const userId = userIdFromAuth ?? input.userId;
    if (!userId) {
      throw new BadRequestException({ message: 'Missing or invalid bill data' });
    }

    if (!input.itemDescription || !input.dueDate || !input.amount) {
      throw new BadRequestException({ message: 'Missing or invalid bill data' });
    }

    const toDate = (v?: string | null) => (v ? new Date(v) : null);

    const entity = this.billRepository.create({
      userId,
      itemDescription: input.itemDescription,
      logoUrl: input.logoUrl ?? null,
      dueDate: new Date(input.dueDate),
      lastChargeDate: toDate(input.lastChargeDate) as any,
      amount: input.amount,
    });

    const saved = await this.billRepository.save(entity);

    return {
      message: 'Bill created successfully',
      data: {
        billId: saved.billId,
        userId: saved.userId,
        itemDescription: saved.itemDescription,
        logoUrl: saved.logoUrl,
        dueDate: (saved.dueDate as Date).toISOString().split('T')[0],
        lastChargeDate: saved.lastChargeDate ? (saved.lastChargeDate as Date).toISOString().split('T')[0] : null,
        amount: parseFloat((saved.amount as unknown as any).toString()),
        createdAt: (saved.createdAt as Date).toISOString(),
        updatedAt: (saved.updatedAt as Date).toISOString(),
      },
    };
  }
}
