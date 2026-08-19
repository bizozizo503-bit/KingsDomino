import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum EventStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  FINISHED = 'finished',
}

export enum EventType {
  WEEKLY = 'weekly',
  SEASONAL = 'seasonal',
  SPECIAL = 'special',
  LIMITED = 'limited',
}

@Entity('events')
export class GameEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500 })
  description: string;

  @Column({ type: 'enum', enum: EventType })
  event_type: EventType;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.UPCOMING })
  status: EventStatus;

  @Column({ nullable: true, length: 200 })
  image_url: string;

  @Column({ type: 'simple-json', nullable: true })
  missions: Array<{
    id: string;
    name: string;
    description: string;
    target: number;
    reward_gold: number;
    reward_xp: number;
    reward_item?: string;
    mission_type: string;
    game_id?: string;
  }>;

  @Column({ type: 'simple-json', nullable: true })
  rewards: Record<string, any>;

  @Column({ type: 'bigint' })
  start_at: number;

  @Column({ type: 'bigint' })
  end_at: number;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('player_event_progress')
export class PlayerEventProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  event_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'simple-json', default: {} })
  mission_progress: Record<string, number>;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ type: 'boolean', default: false })
  is_reward_claimed: boolean;

  @Column({ type: 'bigint', default: 0 })
  last_updated: number;

  @CreateDateColumn()
  created_at: Date;
}
