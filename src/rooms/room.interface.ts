import { GameState } from "../game/game-state.interface";

export interface Room {
  id: string;
  code: string;
  host: string;
  players: number[];
  started: boolean;
  maxPlayers: number;
  createdAt: Date;
  gameState: GameState | null;
}
