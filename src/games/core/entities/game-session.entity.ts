import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SessionStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

@Entity('game_sessions')
@Index(['game_id'])
@Index(['status'])
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  game_id: string;

  @Column()
  room_code: string;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.WAITING })
  status: SessionStatus;

  @Column({ type: 'simple-json' })
  player_ids: string[];

  @Column({ type: 'simple-json' })
  player_names: Record<string, string>;

  @Column({ type: 'simple-json', nullable: true })
  state: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  result: Record<string, any>;

  @Column({ nullable: true })
  winner_id: string;

  @Column({ type: 'int', default: 0 })
  round_number: number;

  @Column({ type: 'bigint', default: 0 })
  started_at: number;

  @Column({ type: 'bigint', nullable: true })
  finished_at: number;

  @Column({ type: 'int', default: 0 })
  turn_count: number;

  @Column({ nullable: true })
  finish_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
