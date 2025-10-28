import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('ExpenseDetails')
export class ExpenseDetail {
  @PrimaryGeneratedColumn({ name: 'expense_detail_id' })
  expenseDetailId: number;

  @Column({ name: 'transaction_id', unique: true })
  transactionId: number;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'sub_category_name', length: 100, nullable: true })
  subCategoryName: string;

  @Column({
    name: 'sub_category_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subCategoryAmount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Quan hệ với Transaction (one-to-one)
  @OneToOne(() => Transaction, (transaction) => transaction.expenseDetail)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  // Quan hệ với Category
  @ManyToOne(() => Category, (category) => category.expenseDetails)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}

