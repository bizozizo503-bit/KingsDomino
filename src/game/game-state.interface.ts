export interface GameState {
  roomCode: string;
  currentPlayer: number;
  started: boolean;
  players: number[];
  dominoDeck: any[];
  board: any[];
}
