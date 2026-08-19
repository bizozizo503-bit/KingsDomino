import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AchievementCategory {
  GAMEPLAY = 'gameplay',
  SOCIAL = 'social',
  COLLECTION = 'collection',
  MILESTONE = 'milestone',
  STREAK = 'streak',
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  key: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500 })
  description: string;

  @Column({ type: 'enum', enum: AchievementCategory })
  category: AchievementCategory;

  @Column({ type: 'int', default: 1 })
  tier: number;

  @Column({ type: 'int', default: 0 })
  xp_reward: number;

  @Column({ type: 'int', default: 0 })
  gold_reward: number;

  @Column({ nullable: true, length: 50 })
  icon: string;

  @Column({ type: 'simple-json', nullable: true })
  requirement: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('player_achievements')
@Index(['user_id', 'achievement_key'], { unique: true })
export class PlayerAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  achievement_key: string;

  @Column({ type: 'boolean', default: false })
  is_claimed: boolean;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ type: 'int', default: 100 })
  target: number;

  @Column({ type: 'bigint', default: 0 })
  unlocked_at: number;

  @Column({ type: 'bigint', nullable: true })
  claimed_at: number;

  @CreateDateColumn()
  created_at: Date;
}
