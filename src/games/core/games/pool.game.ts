import { IGame, GameStartOptions, GameStateUpdate, PlayerId } from '../game.interface';

interface Ball {
  id: number;
  type: 'solid' | 'stripe' | 'eight' | 'cue';
  pocketed: boolean;
  x: number;
  y: number;
}

interface Pocket {
  x: number;
  y: number;
}

export class PoolGame extends IGame {
  readonly GAME_ID = 'pool';
  readonly GAME_NAME = 'Royal Pool';
  readonly GAME_NAME_AR = 'البلياردو الملكي';
  readonly MIN_PLAYERS = 2;
  readonly MAX_PLAYERS = 2;
  readonly ROUND_TIMEOUT_MS = 15 * 60 * 1000;

  private balls: Ball[] = [];
  private playerGroups: Record<string, 'solid' | 'stripe' | null> = {};
  private firstBallPocketed: string | null = null;
  private tableOpen: boolean = true;

  initGame(options: GameStartOptions): Record<string, any> {
    this._players = options.playerIds;
    this._currentPlayerIndex = 0;

    this.balls = this.createBalls();
    this.playerGroups[this._players[0]] = null;
    this.playerGroups[this._players[1]] = null;
    this.firstBallPocketed = null;
    this.tableOpen = true;
    this._state = { phase: 'playing' };

    return this.getStateForPlayer(null as any);
  }

  handleMove(playerId: PlayerId, action: string, data: Record<string, any>): GameStateUpdate {
    if (playerId !== this.getCurrentPlayer()) {
      throw new Error('NOT_YOUR_TURN');
    }

    if (action === 'shoot') {
      return this.handleShoot(playerId, data);
    }

    throw new Error('INVALID_ACTION');
  }

  private handleShoot(playerId: string, data: Record<string, any>): GameStateUpdate {
    const { pocketedBallIds, scratch } = data;

    if (scratch) {
      return this.afterShot(playerId, [], true);
    }

    const pocketedBalls = (pocketedBallIds || [])
      .map((id: number) => this.balls.find(b => b.id === id))
      .filter((b): b is Ball => b !== undefined);

    for (const ball of pocketedBalls) {
      ball.pocketed = true;
    }

    if (this.tableOpen && pocketedBalls.length > 0) {
      const nonEight = pocketedBalls.find(b => b.type !== 'eight');
      if (nonEight) {
        this.playerGroups[playerId] = nonEight.type as 'solid' | 'stripe';
        const opponent = this.getOpponent(playerId);
        this.playerGroups[opponent] = nonEight.type === 'solid' ? 'stripe' : 'solid';
        this.tableOpen = false;
      }
    }

    const eightPocketed = pocketedBalls.some(b => b.type === 'eight');
    if (eightPocketed) {
      const myGroup = this.playerGroups[playerId];
      const allMyBallsPocketed = this.balls
        .filter(b => b.type === myGroup && !pocketedBalls.includes(b))
        .length === 0;

      if (allMyBallsPocketed) {
        this._state.phase = 'finished';
        return {
          type: 'game_over',
          data: { winner: playerId, reason: 'pocketed_eight' },
        };
      } else {
        this._state.phase = 'finished';
        return {
          type: 'game_over',
          data: { winner: this.getOpponent(playerId), reason: 'early_eight' },
        };
      }
    }

    const myGroup = this.playerGroups[playerId];
    const relevantPocketed = pocketedBalls.filter(b => b.type === myGroup);
    if (relevantPocketed.length > 0 && !scratch) {
      return this.afterShot(playerId, pocketedBallIds, false);
    }

    return this.afterShot(playerId, pocketedBallIds || [], false);
  }

  private afterShot(playerId: string, pocketedBallIds: number[], scratch: boolean): GameStateUpdate {
    if (scratch) {
      const nextPlayer = this.advanceTurn();
      return {
        type: 'scratch',
        data: {
          playerId,
          currentPlayer: nextPlayer,
          message: ' bola no bolso! Turno do oponente',
        },
      };
    }

    const myGroup = this.playerGroups[playerId];
    const pocketed = pocketedBallIds
      .map(id => this.balls.find(b => b.id === id))
      .filter(b => b && b.type === myGroup);

    if (pocketed.length > 0) {
      return {
        type: 'ball_pocketed',
        data: {
          playerId,
          pocketedBallIds,
          currentPlayer: playerId,
          message: 'nice shot!',
        },
      };
    }

    const nextPlayer = this.advanceTurn();
    return {
      type: 'shot_complete',
      data: {
        playerId,
        pocketedBallIds,
        currentPlayer: nextPlayer,
      },
    };
  }

  getStateForPlayer(_playerId: PlayerId): Record<string, any> {
    return {
      balls: this.balls,
      currentPlayer: this.getCurrentPlayer(),
      playerGroups: this.playerGroups,
      tableOpen: this.tableOpen,
      phase: this._state.phase,
    };
  }

  isGameOver(): boolean {
    return this._state.phase === 'finished';
  }

  getResult(): any {
    const winnerId = this._state.winner;
    const scores: Record<string, number> = {};

    for (const playerId of this._players) {
      scores[playerId] = playerId === winnerId ? 100 : 0;
    }

    return {
      winner: winnerId || null,
      scores,
      rewards: this.calculateRewards(scores),
      finishedAt: Date.now(),
      reason: 'normal',
    };
  }

  private createBalls(): Ball[] {
    const balls: Ball[] = [];

    balls.push({ id: 0, type: 'cue', pocketed: false, x: 0.5, y: 0.5 });

    for (let i = 1; i <= 7; i++) {
      balls.push({ id: i, type: 'solid', pocketed: false, x: 0.5 + Math.random() * 0.1, y: 0.5 + Math.random() * 0.1 });
    }

    for (let i = 9; i <= 15; i++) {
      balls.push({ id: i, type: 'stripe', pocketed: false, x: 0.5 + Math.random() * 0.1, y: 0.5 + Math.random() * 0.1 });
    }

    balls.push({ id: 8, type: 'eight', pocketed: false, x: 0.65, y: 0.5 });

    return balls;
  }

  private getOpponent(playerId: string): string {
    return this._players.find(p => p !== playerId)!;
  }
}
