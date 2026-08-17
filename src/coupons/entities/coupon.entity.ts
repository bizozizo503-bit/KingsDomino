import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ type: 'bigint' })
  reward_amount: string;

  @Column({ type: 'int', nullable: true })
  max_redemptions_total: number;

  @Column({ type: 'int', default: 1 })
  max_redemptions_per_user: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
