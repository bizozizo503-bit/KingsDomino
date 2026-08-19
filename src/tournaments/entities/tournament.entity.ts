import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum TournamentStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export enum TournamentType {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
  SWISS = 'swiss',
}

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column()
  game_id: string;

  @Column({ type: 'enum', enum: TournamentType, default: TournamentType.SINGLE_ELIMINATION })
  type: TournamentType;

  @Column({ type: 'enum', enum: TournamentStatus, default: TournamentStatus.WAITING })
  status: TournamentStatus;

  @Column({ type: 'int' })
  max_participants: number;

  @Column({ type: 'int', default: 0 })
  current_participants: number;

  @Column({ type: 'int', default: 0 })
  entry_fee: number;

  @Column({ type: 'simple-json', nullable: true })
  rewards: Record<string, any>;

  @Column({ type: 'bigint' })
  start_at: number;

  @Column({ type: 'bigint', nullable: true })
  end_at: number;

  @Column({ type: 'bigint', default: 0 })
  registration_open_at: number;

  @Column({ type: 'bigint', default: 0 })
  registration_close_at: number;

  @Column({ type: 'simple-json', nullable: true })
  bracket: Record<string, any>;

  @Column({ nullable: true })
  winner_id: string;

  @Column({ type: 'boolean', default: false })
  isRanked: boolean;

  @Column({ nullable: true, length: 200 })
  rules: string;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('tournament_participants')
@Index(['tournament_id', 'user_id'], { unique: true })
export class TournamentParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tournament_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'int', default: 0 })
  current_round: number;

  @Column({ type: 'int', default: 0 })
  wins: number;

  @Column({ type: 'int', default: 0 })
  losses: number;

  @Column({ type: 'int', default: 0 })
  draws: number;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'boolean', default: false })
  is_eliminated: boolean;

  @Column({ type: 'int', nullable: true })
  final_rank: number;

  @Column({ type: 'simple-json', nullable: true })
  match_history: Array<{ opponentId: string; won: boolean; score: number; round: number }>;

  @Column({ type: 'bigint', default: 0 })
  joined_at: number;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('tournament_rounds')
@Index(['tournament_id'])
export class TournamentRound {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tournament_id: string;

  @Column({ type: 'int' })
  round_number: number;

  @Column({ type: 'simple-json' })
  matches: Array<{ matchId: string; player1: string; player2: string; winner?: string; score?: string; sessionId?: string }>;

  @Column({ type: 'boolean', default: false })
  is_complete: boolean;

  @Column({ type: 'bigint', default: 0 })
  started_at: number;

  @Column({ type: 'bigint', default: 0 })
  finished_at: number;

  @CreateDateColumn()
  created_at: Date;
}
