import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';

export enum AccountType {
  CHECKING = 'Checking',
  CREDIT_CARD = 'Credit Card',
  SAVINGS = 'Savings',
  INVESTMENT = 'Investment',
  LOAN = 'Loan',
}

@Entity('Accounts')
export class Account {
  @PrimaryGeneratedColumn({ name: 'account_id' })
  accountId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'bank_name', length: 100, nullable: true })
  bankName: string;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: AccountType,
  })
  accountType: AccountType;

  @Column({ name: 'branch_name', length: 100, nullable: true })
  branchName: string;

  @Column({ name: 'account_number_full', length: 50, nullable: true })
  accountNumberFull: string;

  @Column({ name: 'account_number_last_4', length: 4, nullable: true })
  accountNumberLast4: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0.0,
  })
  balance: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Quan hệ với User
  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Quan hệ với Transactions
  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];
}
