export type PlayerId = string;

export interface GameMove {
  playerId: PlayerId;
  action: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface GameResult {
  winner: PlayerId | null;
  scores: Record<PlayerId, number>;
  rewards: Record<PlayerId, { gold: number; xp: number }>;
  finishedAt: number;
  reason: 'normal' | 'timeout' | 'disconnect' | 'surrender';
}

export interface GameStartOptions {
  playerIds: PlayerId[];
  playerNames: Record<PlayerId, string>;
  config?: Record<string, any>;
}

export interface GameStateUpdate {
  type: string;
  data: Record<string, any>;
  to?: PlayerId[];
}

export abstract class IGame {
  abstract readonly GAME_ID: string;
  abstract readonly GAME_NAME: string;
  abstract readonly GAME_NAME_AR: string;
  abstract readonly MIN_PLAYERS: number;
  abstract readonly MAX_PLAYERS: number;
  abstract readonly ROUND_TIMEOUT_MS: number;

  protected _state: Record<string, any> = {};
  protected _players: PlayerId[] = [];
  protected _currentPlayerIndex: number = 0;

  abstract initGame(options: GameStartOptions): Record<string, any>;
  abstract handleMove(playerId: PlayerId, action: string, data: Record<string, any>): GameStateUpdate;
  abstract getStateForPlayer(playerId: PlayerId): Record<string, any>;
  abstract isGameOver(): boolean;
  abstract getResult(): GameResult;

  getPlayers(): PlayerId[] {
    return [...this._players];
  }

  getCurrentPlayer(): PlayerId | null {
    if (this._players.length === 0) return null;
    return this._players[this._currentPlayerIndex % this._players.length];
  }

  advanceTurn(): PlayerId {
    this._currentPlayerIndex = (this._currentPlayerIndex + 1) % this._players.length;
    return this._players[this._currentPlayerIndex];
  }

  calculateRewards(scores: Record<PlayerId, number>): Record<PlayerId, { gold: number; xp: number }> {
    const rewards: Record<PlayerId, { gold: number; xp: number }> = {};
    const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);

    for (let i = 0; i < sorted.length; i++) {
      const [playerId] = sorted[i];
      const baseGold = i === 0 ? 50 : i === 1 ? 25 : i === 2 ? 10 : 5;
      const baseXp = i === 0 ? 100 : i === 1 ? 60 : i === 2 ? 30 : 10;
      rewards[playerId] = { gold: baseGold, xp: baseXp };
    }

    return rewards;
  }
}
