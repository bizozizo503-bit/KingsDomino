import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('player_profiles')
export class PlayerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column({ nullable: true, length: 100 })
  display_name: string;

  @Column({ nullable: true, length: 500 })
  avatar_url: string;

  @Column({ nullable: true, length: 50 })
  avatar_frame: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'bigint', default: 0 })
  xp: string;

  @Column({ type: 'bigint', default: 0 })
  total_xp: string;

  @Column({ type: 'int', default: 0 })
  games_played: number;

  @Column({ type: 'int', default: 0 })
  games_won: number;

  @Column({ type: 'int', default: 0 })
  current_win_streak: number;

  @Column({ type: 'int', default: 0 })
  best_win_streak: number;

  @Column({ type: 'int', default: 0 })
  total_gold_earned: string;

  @Column({ nullable: true, length: 20 })
  country: string;

  @Column({ nullable: true, length: 200 })
  bio: string;

  @Column({ type: 'boolean', default: true })
  is_online: boolean;

  @Column({ type: 'bigint', default: 0 })
  last_seen_at: number;

  @Column({ type: 'int', default: 0 })
  friends_count: number;

  @Column({ type: 'simple-json', nullable: true })
  stats: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
