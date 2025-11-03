import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { ExpenseDetail } from '../../expense-detail/entities/expense-detail.entity';

export enum TransactionType {
  REVENUE = 'Revenue',
  EXPENSE = 'Expense',
}

export enum TransactionStatus {
  COMPLETE = 'Complete',
  PENDING = 'Pending',
  FAILED = 'Failed',
}

@Entity('Transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'transaction_date', type: 'datetime' })
  transactionDate: Date;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ name: 'item_description', length: 255 })
  itemDescription: string;

  @Column({ name: 'shop_name', length: 100, nullable: true })
  shopName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETE,
  })
  status: TransactionStatus;

  @Column({ name: 'receipt_id', length: 50, nullable: true })
  receiptId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Quan hệ với Account
  @ManyToOne(() => Account, (account) => account.transactions)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  // Quan hệ với ExpenseDetail (one-to-one)
  @OneToOne(() => ExpenseDetail, (expenseDetail) => expenseDetail.transaction)
  expenseDetail: ExpenseDetail;
}
