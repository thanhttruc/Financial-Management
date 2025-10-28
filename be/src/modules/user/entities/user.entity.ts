import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { Bill } from '../../bill/entities/bill.entity';
import { Goal } from '../../goal/entities/goal.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ name: 'profile_picture_url', length: 255, nullable: true })
  profilePictureUrl: string;

  @Column({ name: 'total_balance', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalBalance: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Quan hệ với Accounts
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  // Quan hệ với Bills
  @OneToMany(() => Bill, (bill) => bill.user)
  bills: Bill[];

  // Quan hệ với Goals
  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];
}

