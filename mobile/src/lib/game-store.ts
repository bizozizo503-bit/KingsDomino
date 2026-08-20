export interface Domino {
  left: number;
  right: number;
}

export interface GameStartPayload {
  roomCode: string;
  hand: Domino[];
  currentPlayer: string;
  board: Domino[];
  players: string[];
  playerNames: Record<string, string>;
}

let initial: GameStartPayload | null = null;

export function setInitialGameState(state: GameStartPayload | null): void {
  initial = state;
}

export function getInitialGameState(): GameStartPayload | null {
  return initial;
}