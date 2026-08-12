import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-json')
  board: number[][];

  @Column()
  currentPlayer: number;

  @Column()
  turn: number;

  @Column({ default: false })
  finished: boolean;
}
