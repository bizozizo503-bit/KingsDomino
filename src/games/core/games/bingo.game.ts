import { IGame, GameStartOptions, GameStateUpdate, PlayerId } from '../game.interface';

interface BingoCard {
  numbers: number[][];
  marked: boolean[][];
}

export class BingoGame extends IGame {
  readonly GAME_ID = 'bingo';
  readonly GAME_NAME = 'Royal Bingo';
  readonly GAME_NAME_AR = 'البينجو الملكي';
  readonly MIN_PLAYERS = 1;
  readonly MAX_PLAYERS = 100;
  readonly ROUND_TIMEOUT_MS = 5 * 60 * 1000;

  private cards: Record<string, BingoCard> = {};
  private drawnNumbers: number[] = [];
  private availableNumbers: number[] = [];
  private winPatterns: boolean[][][] = [];

  initGame(options: GameStartOptions): Record<string, any> {
    this._players = options.playerIds;
    this._currentPlayerIndex = 0;

    this.availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    this.availableNumbers = this.shuffleArray(this.availableNumbers);
    this.drawnNumbers = [];
    this.cards = {};

    for (const playerId of this._players) {
      this.cards[playerId] = this.createCard();
    }

    this.winPatterns = this.createWinPatterns();
    this._state = { phase: 'playing' };

    return this.getStateForPlayer(null as any);
  }

  handleMove(playerId: PlayerId, action: string, _data: Record<string, any>): GameStateUpdate {
    if (action === 'draw') {
      return this.handleDraw();
    }

    if (action === 'bingo') {
      return this.handleBingo(playerId);
    }

    throw new Error('INVALID_ACTION');
  }

  private handleDraw(): GameStateUpdate {
    if (this.availableNumbers.length === 0) {
      this._state.phase = 'finished';
      return {
        type: 'game_over',
        data: { winner: null, reason: 'no_more_numbers' },
      };
    }

    const number = this.availableNumbers.pop()!;
    this.drawnNumbers.push(number);

    for (const playerId of this._players) {
      this.markNumber(playerId, number);
    }

    return {
      type: 'number_drawn',
      data: {
        number,
        drawnNumbers: this.drawnNumbers,
        remainingCount: this.availableNumbers.length,
      },
    };
  }

  private handleBingo(playerId: string): GameStateUpdate {
    const card = this.cards[playerId];
    if (!card) throw new Error('NO_CARD');

    const hasBingo = this.checkBingo(card);
    if (!hasBingo) {
      throw new Error('NO_BINGO');
    }

    this._state.phase = 'finished';

    return {
      type: 'game_over',
      data: {
        winner: playerId,
        reason: 'bingo',
        drawnNumbers: this.drawnNumbers,
      },
    };
  }

  private markNumber(playerId: string, number: number): void {
    const card = this.cards[playerId];
    if (!card) return;

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (card.numbers[row][col] === number) {
          card.marked[row][col] = true;
        }
      }
    }
  }

  private checkBingo(card: BingoCard): boolean {
    for (const pattern of this.winPatterns) {
      let match = true;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (pattern[row][col] && !card.marked[row][col]) {
            match = false;
            break;
          }
        }
        if (!match) break;
      }
      if (match) return true;
    }
    return false;
  }

  private createCard(): BingoCard {
    const columns: { min: number; max: number }[] = [
      { min: 1, max: 15 },
      { min: 16, max: 30 },
      { min: 31, max: 45 },
      { min: 46, max: 60 },
      { min: 61, max: 75 },
    ];

    const numbers: number[][] = [];
    const marked: boolean[][] = [];
    const used = new Set<number>();

    for (let col = 0; col < 5; col++) {
      const colNums: number[] = [];
      for (let n = columns[col].min; n <= columns[col].max; n++) {
        colNums.push(n);
      }
      const shuffled = this.shuffleArray(colNums);

      for (let row = 0; row < 5; row++) {
        if (!numbers[row]) numbers[row] = [];
        if (!marked[row]) marked[row] = [];
        const num = shuffled[row];
        numbers[row][col] = num;
        marked[row][col] = false;
        used.add(num);
      }
    }

    numbers[2][2] = 0;
    marked[2][2] = true;

    return { numbers, marked };
  }

  private createWinPatterns(): boolean[][][] {
    const patterns: boolean[][][] = [];

    for (let row = 0; row < 5; row++) {
      const pattern: boolean[][] = [];
      for (let r = 0; r < 5; r++) {
        pattern[r] = [];
        for (let c = 0; c < 5; c++) {
          pattern[r][c] = r === row;
        }
      }
      patterns.push(pattern);
    }

    for (let col = 0; col < 5; col++) {
      const pattern: boolean[][] = [];
      for (let r = 0; r < 5; r++) {
        pattern[r] = [];
        for (let c = 0; c < 5; c++) {
          pattern[r][c] = c === col;
        }
      }
      patterns.push(pattern);
    }

    const diag1: boolean[][] = [];
    for (let r = 0; r < 5; r++) {
      diag1[r] = [];
      for (let c = 0; c < 5; c++) {
        diag1[r][c] = r === c;
      }
    }
    patterns.push(diag1);

    const diag2: boolean[][] = [];
    for (let r = 0; r < 5; r++) {
      diag2[r] = [];
      for (let c = 0; c < 5; c++) {
        diag2[r][c] = c === 4 - r;
      }
    }
    patterns.push(diag2);

    return patterns;
  }

  getStateForPlayer(_playerId: PlayerId): Record<string, any> {
    return {
      card: this.cards[_playerId] || null,
      drawnNumbers: this.drawnNumbers,
      currentPlayer: this.getCurrentPlayer(),
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

  private shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
