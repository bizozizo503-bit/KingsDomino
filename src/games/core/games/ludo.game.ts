import { IGame, GameStartOptions, GameStateUpdate, PlayerId } from '../game.interface';

type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

interface LudoPiece {
  id: number;
  position: number;
  home: boolean;
  safe: boolean;
}

interface LudoPlayerState {
  color: PlayerColor;
  pieces: LudoPiece[];
  homeCount: number;
}

export class LudoGame extends IGame {
  readonly GAME_ID = 'ludo';
  readonly GAME_NAME = 'Royal Ludo';
  readonly GAME_NAME_AR = 'لودو الملكي';
  readonly MIN_PLAYERS = 2;
  readonly MAX_PLAYERS = 4;
  readonly ROUND_TIMEOUT_MS = 20 * 60 * 1000;

  private playerStates: Record<string, LudoPlayerState> = {};
  private diceValue: number = 0;
  private consecutiveSixes: number = 0;
  private colors: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
  private readonly TOTAL_POSITIONS = 52;
  private readonly HOME_COLUMN_LENGTH = 6;
  private readonly SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

  initGame(options: GameStartOptions): Record<string, any> {
    this._players = options.playerIds;
    this._currentPlayerIndex = 0;
    this.consecutiveSixes = 0;

    this.playerStates = {};

    for (let i = 0; i < this._players.length; i++) {
      const playerId = this._players[i];
      const color = this.colors[i];

      this.playerStates[playerId] = {
        color,
        pieces: [
          { id: 0, position: -1, home: false, safe: false },
          { id: 1, position: -1, home: false, safe: false },
          { id: 2, position: -1, home: false, safe: false },
          { id: 3, position: -1, home: false, safe: false },
        ],
        homeCount: 0,
      };
    }

    this._state = { phase: 'playing' };
    this.diceValue = 0;

    return this.getStateForPlayer(null as any);
  }

  handleMove(playerId: PlayerId, action: string, data: Record<string, any>): GameStateUpdate {
    if (playerId !== this.getCurrentPlayer()) {
      throw new Error('NOT_YOUR_TURN');
    }

    if (action === 'roll_dice') {
      return this.handleRollDice(playerId);
    }

    if (action === 'move_piece') {
      return this.handleMovePiece(playerId, data);
    }

    throw new Error('INVALID_ACTION');
  }

  private handleRollDice(playerId: string): GameStateUpdate {
    this.diceValue = Math.floor(Math.random() * 6) + 1;

    if (this.diceValue === 6) {
      this.consecutiveSixes += 1;
    } else {
      this.consecutiveSixes = 0;
    }

    if (this.consecutiveSixes >= 3) {
      this.consecutiveSixes = 0;
      return {
        type: 'three_sixes',
        data: {
          dice: 6,
          message: 'ثلاثة ستات! يتم تخطي الدور',
          currentPlayer: this.advanceTurn(),
        },
      };
    }

    const playerState = this.playerStates[playerId];
    const hasMovablePiece = playerState.pieces.some(piece => {
      if (piece.home) return false;
      if (piece.position === -1) return this.diceValue === 6;
      return true;
    });

    if (!hasMovablePiece && this.diceValue !== 6) {
      const nextPlayer = this.advanceTurn();
      return {
        type: 'no_moves',
        data: {
          dice: this.diceValue,
          currentPlayer: nextPlayer,
          message: 'لا يوجد حركات متاحة',
        },
      };
    }

    return {
      type: 'dice_rolled',
      data: {
        playerId,
        dice: this.diceValue,
        pieces: playerState.pieces,
        canMove: hasMovablePiece,
        consecutiveSixes: this.consecutiveSixes,
      },
    };
  }

  private handleMovePiece(playerId: string, data: Record<string, any>): GameStateUpdate {
    const pieceId = data.pieceId;
    const playerState = this.playerStates[playerId];
    const piece = playerState.pieces[pieceId];

    if (!piece) throw new Error('INVALID_PIECE');
    if (piece.home) throw new Error('PIECE_ALREADY_HOME');

    if (piece.position === -1) {
      if (this.diceValue !== 6) throw new Error('NEED_SIX_TO_ENTER');
      piece.position = 0;
      piece.safe = this.SAFE_POSITIONS.includes(0);

      return this.afterMove(playerId, pieceId);
    }

    const newPosition = piece.position + this.diceValue;
    if (newPosition > this.TOTAL_POSITIONS + this.HOME_COLUMN_LENGTH) {
      throw new Error('MOVE_TOO_FAR');
    }

    if (newPosition === this.TOTAL_POSITIONS) {
      piece.home = true;
      piece.position = newPosition;
      playerState.homeCount += 1;

      if (playerState.homeCount === 4) {
        this._state.phase = 'finished';
        return {
          type: 'game_over',
          data: { winner: playerId, reason: 'all_home' },
        };
      }

      return this.afterMove(playerId, pieceId);
    }

    piece.position = newPosition;
    piece.safe = this.SAFE_POSITIONS.includes(newPosition % this.TOTAL_POSITIONS);

    if (!piece.safe) {
      for (const otherPlayer of this._players) {
        if (otherPlayer === playerId) continue;
        const otherState = this.playerStates[otherPlayer];

        for (const otherPiece of otherState.pieces) {
          if (otherPiece.home || otherPiece.position === -1) continue;
          if (otherPiece.position === piece.position) {
            otherPiece.position = -1;
            otherPiece.safe = false;
          }
        }
      }
    }

    return this.afterMove(playerId, pieceId);
  }

  private afterMove(playerId: string, pieceId: number): GameStateUpdate {
    if (this.diceValue === 6) {
      return {
        type: 'piece_moved',
        data: {
          playerId,
          pieceId,
          dice: this.diceValue,
          pieces: this.playerStates[playerId].pieces,
          extraTurn: true,
          currentPlayer: playerId,
        },
      };
    }

    const nextPlayer = this.advanceTurn();
    return {
      type: 'piece_moved',
      data: {
        playerId,
        pieceId,
        dice: this.diceValue,
        pieces: this.playerStates[playerId].pieces,
        extraTurn: false,
        currentPlayer: nextPlayer,
      },
    };
  }

  getStateForPlayer(_playerId: PlayerId): Record<string, any> {
    const result: Record<string, any> = {
      board: {},
      currentPlayer: this.getCurrentPlayer(),
      phase: this._state.phase,
      diceValue: this.diceValue,
    };

    for (const [pid, state] of Object.entries(this.playerStates)) {
      result.board[pid] = {
        color: state.color,
        pieces: state.pieces,
        homeCount: state.homeCount,
      };
    }

    return result;
  }

  isGameOver(): boolean {
    return this._state.phase === 'finished';
  }

  getResult(): any {
    const scores: Record<string, number> = {};
    let winner: string | null = null;

    for (const [playerId, state] of Object.entries(this.playerStates)) {
      const score = state.homeCount * 25;
      scores[playerId] = score;
      if (state.homeCount === 4) {
        winner = playerId;
      }
    }

    return {
      winner,
      scores,
      rewards: this.calculateRewards(scores),
      finishedAt: Date.now(),
      reason: 'normal',
    };
  }
}
