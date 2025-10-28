import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExpenseDetail } from '../../expense-detail/entities/expense-detail.entity';
import { Goal } from '../../goal/entities/goal.entity';

@Entity('Categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'category_name', length: 50, unique: true })
  categoryName: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Quan hệ với ExpenseDetails
  @OneToMany(() => ExpenseDetail, (expenseDetail) => expenseDetail.category)
  expenseDetails: ExpenseDetail[];

  // Quan hệ với Goals
  @OneToMany(() => Goal, (goal) => goal.category)
  goals: Goal[];
}

