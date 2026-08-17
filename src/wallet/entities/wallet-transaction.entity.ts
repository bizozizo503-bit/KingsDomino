import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionSource {
  DAILY_REWARD = 'DAILY_REWARD',
  COUPON = 'COUPON',
  GAME_REWARD = 'GAME_REWARD',
  ADMIN_ADJUST = 'ADMIN_ADJUST',
  PURCHASE = 'PURCHASE',
  INITIAL = 'INITIAL',
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  wallet_id: string;

  @ManyToOne(() => Wallet, { eager: false })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionSource })
  source: TransactionSource;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ type: 'bigint' })
  balance_after: string;

  @Column({ unique: true })
  idempotency_key: string;

  @Column({ type: 'varchar', nullable: true })
  reference_id: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
