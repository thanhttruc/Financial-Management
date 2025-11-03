import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { BillController } from './bill.controller';
import { BillService } from './bill.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Module quản lý bills (hóa đơn định kỳ)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Bill]), AuthModule],
  controllers: [BillController],
  providers: [BillService],
  exports: [BillService],
})
export class BillModule {}


