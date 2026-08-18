import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Coupon } from './coupon.entity';

@Entity('coupon_redemptions')
@Index('UQ_coupon_redemption_coupon_user', ['coupon_id', 'user_id'], { unique: true })
export class CouponRedemption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  coupon_id: string;

  @ManyToOne(() => Coupon, { eager: false })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @Column()
  user_id: string;

  @Column()
  wallet_transaction_id: string;

  @CreateDateColumn()
  redeemed_at: Date;
}
