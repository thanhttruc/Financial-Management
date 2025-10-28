import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

export enum GoalType {
  SAVING = 'Saving',
  EXPENSE_LIMIT = 'Expense_Limit',
}

@Entity('Goals')
export class Goal {
  @PrimaryGeneratedColumn({ name: 'goal_id' })
  goalId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    name: 'goal_type',
    type: 'enum',
    enum: GoalType,
  })
  goalType: GoalType;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({
    name: 'target_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  targetAmount: number;

  @Column({
    name: 'target_achieved',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0.0,
  })
  targetAchieved: number;

  @Column({
    name: 'present_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  presentAmount: number;

  @Column({ name: 'last_updated', type: 'datetime', nullable: true })
  lastUpdated: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Quan hệ với User
  @ManyToOne(() => User, (user) => user.goals)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Quan hệ với Category (optional)
  @ManyToOne(() => Category, (category) => category.goals)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}

