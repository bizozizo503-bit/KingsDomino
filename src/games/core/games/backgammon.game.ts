import { IGame, GameStartOptions, GameStateUpdate, PlayerId } from '../game.interface';

interface BackgammonPiece {
  player: PlayerId;
  point: number;
  borneOff: boolean;
}

interface BackgammonPlayerState {
  pieces: BackgammonPiece[];
  borneOffCount: number;
  checkersOnBar: number;
}

export class BackgammonGame extends IGame {
  readonly GAME_ID = 'backgammon';
  readonly GAME_NAME = 'Royal Backgammon';
  readonly GAME_NAME_AR = 'الطاولة الملكية';
  readonly MIN_PLAYERS = 2;
  readonly MAX_PLAYERS = 2;
  readonly ROUND_TIMEOUT_MS = 25 * 60 * 1000;

  private board: (BackgammonPiece | null)[] = new Array(24).fill(null);
  private playerStates: Record<string, BackgammonPlayerState> = {};
  private diceRoll: [number, number] = [0, 0];
  private usedMoves: boolean[] = [];
  private direction: Record<string, number> = {};

  initGame(options: GameStartOptions): Record<string, any> {
    this._players = options.playerIds;
    this._currentPlayerIndex = 0;

    this.playerStates[this._players[0]] = {
      pieces: [],
      borneOffCount: 0,
      checkersOnBar: 0,
    };
    this.playerStates[this._players[1]] = {
      pieces: [],
      borneOffCount: 0,
      checkersOnBar: 0,
    };

    this.direction[this._players[0]] = 1;
    this.direction[this._players[1]] = -1;

    this.setupPieces();
    this._state = { phase: 'playing' };
    this.rollDice();

    return this.getStateForPlayer(null as any);
  }

  private setupPieces(): void {
    const p1 = this._players[0];
    const p2 = this._players[1];

    const setup = [
      { point: 0, player: p2, count: 2 },
      { point: 5, player: p1, count: 5 },
      { point: 7, player: p1, count: 3 },
      { point: 11, player: p2, count: 5 },
      { point: 12, player: p1, count: 5 },
      { point: 16, player: p2, count: 3 },
      { point: 18, player: p2, count: 5 },
      { point: 23, player: p1, count: 2 },
    ];

    for (const s of setup) {
      for (let i = 0; i < s.count; i++) {
        const piece: BackgammonPiece = { player: s.player, point: s.point, borneOff: false };
        this.playerStates[s.player].pieces.push(piece);
      }
    }
  }

  private rollDice(): void {
    this.diceRoll = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
    this.usedMoves = this.diceRoll[0] === this.diceRoll[1]
      ? [false, false, false, false]
      : [false, false];
  }

  handleMove(playerId: PlayerId, action: string, data: Record<string, any>): GameStateUpdate {
    if (playerId !== this.getCurrentPlayer()) {
      throw new Error('NOT_YOUR_TURN');
    }

    if (action === 'move_checker') {
      return this.handleMoveChecker(playerId, data);
    }

    if (action === 'bear_off') {
      return this.handleBearOff(playerId, data);
    }

    throw new Error('INVALID_ACTION');
  }

  private handleMoveChecker(playerId: string, data: Record<string, any>): GameStateUpdate {
    const { fromPoint, moveIndex } = data;
    const diceValue = this.diceRoll[moveIndex];

    if (this.usedMoves[moveIndex]) {
      throw new Error('MOVE_ALREADY_USED');
    }

    const dir = this.direction[playerId];
    const toPoint = fromPoint + (dir * diceValue);

    if (toPoint < 0 || toPoint > 23) {
      throw new Error('INVALID_DESTINATION');
    }

    const targetPiece = this.board[toPoint];
    if (targetPiece && targetPiece.player !== playerId) {
      const opponent = this._players.find(p => p !== playerId)!;
      this.playerStates[opponent].checkersOnBar += 1;
      this.board[toPoint] = null;
    }

    this.board[toPoint] = { player: playerId, point: toPoint, borneOff: false };
    this.usedMoves[moveIndex] = true;

    const allUsed = this.usedMoves.every(u => u);
    if (allUsed) {
      const nextPlayer = this.advanceTurn();
      this.rollDice();
      return {
        type: 'turn_ended',
        data: {
          playerId,
          currentPlayer: nextPlayer,
          dice: this.diceRoll,
        },
      };
    }

    return {
      type: 'checker_moved',
      data: {
        playerId,
        fromPoint,
        toPoint,
        dice: diceValue,
        remainingMoves: this.usedMoves.filter(u => !u).length,
        diceRoll: this.diceRoll,
        usedMoves: this.usedMoves,
      },
    };
  }

  private handleBearOff(playerId: string, data: Record<string, any>): GameStateUpdate {
    const { fromPoint, moveIndex } = data;
    const diceValue = this.diceRoll[moveIndex];

    if (this.usedMoves[moveIndex]) {
      throw new Error('MOVE_ALREADY_USED');
    }

    const dir = this.direction[playerId];
    const homeStart = dir === 1 ? 18 : 0;
    const homeEnd = dir === 1 ? 23 : 5;

    if (fromPoint < homeStart || fromPoint > homeEnd) {
      throw new Error('NOT_IN_HOME_BOARD');
    }

    this.board[fromPoint] = null;
    this.playerStates[playerId].borneOffCount += 1;
    this.usedMoves[moveIndex] = true;

    if (this.playerStates[playerId].borneOffCount === 15) {
      this._state.phase = 'finished';
      return {
        type: 'game_over',
        data: { winner: playerId, reason: 'all_borne_off' },
      };
    }

    return {
      type: 'checker_borne_off',
      data: {
        playerId,
        fromPoint,
        borneOffCount: this.playerStates[playerId].borneOffCount,
        remainingMoves: this.usedMoves.filter(u => !u).length,
        diceRoll: this.diceRoll,
        usedMoves: this.usedMoves,
      },
    };
  }

  getStateForPlayer(_playerId: PlayerId): Record<string, any> {
    return {
      board: this.board,
      currentPlayer: this.getCurrentPlayer(),
      diceRoll: this.diceRoll,
      usedMoves: this.usedMoves,
      playerStates: this.playerStates,
      phase: this._state.phase,
    };
  }

  isGameOver(): boolean {
    return this._state.phase === 'finished';
  }

  getResult(): any {
    const scores: Record<string, number> = {};
    const winnerId = this._state.winner;

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
}
