import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum LeaderboardPeriod {
  ALL_TIME = 'all_time',
  SEASON = 'season',
  WEEKLY = 'weekly',
  DAILY = 'daily',
}

@Entity('leaderboards')
export class LeaderboardEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  game_id: string;

  @Column({ type: 'enum', enum: LeaderboardPeriod, default: LeaderboardPeriod.ALL_TIME })
  period: LeaderboardPeriod;

  @Column()
  player_id: string;

  @Column({ type: 'bigint', default: 0 })
  score: string;

  @Column({ type: 'int', default: 0 })
  games_played: number;

  @Column({ type: 'int', default: 0 })
  games_won: number;

  @Column({ type: 'int', default: 0 })
  win_streak: number;

  @Column({ type: 'int', default: 0 })
  best_win_streak: number;

  @Column({ type: 'int', default: 0 })
  rank: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'bigint', default: 0 })
  updated_at: number;
}
