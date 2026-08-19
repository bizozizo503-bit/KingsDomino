import { Domino } from '../../game/domino.interface';

export interface PublicGameStateDto {
  started: boolean;
  currentPlayer: string;
  board: Domino[];
  finishReason?: 'normal' | 'blocked';
}

export interface PublicRoomDto {
  code: string;
  name: string;
  maxPlayers: number;
  host: string;
  status: 'waiting' | 'playing' | 'finished';
  players: string[];
  playerNames: Record<string, string>;
  started: boolean;
  gameState: PublicGameStateDto;
}
