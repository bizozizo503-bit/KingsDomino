import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('daily_rewards')
@Index(['user_id'], { unique: true })
export class DailyReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ type: 'int', default: 1 })
  streak: number;

  @Column({ type: 'int', default: 0 })
  last_claim_day: number;

  @Column({ type: 'bigint', default: 0 })
  last_claim_at: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'simple-json', nullable: true })
  reward_history: Array<{ day: number; amount: number; claimedAt: number }>;

  @CreateDateColumn()
  created_at: Date;
}
