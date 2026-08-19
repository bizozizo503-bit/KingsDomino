import { IGame, GameStartOptions, GameStateUpdate, PlayerId } from '../game.interface';

type PieceColor = 'white' | 'black';
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
}

interface ChessMoveRecord {
  from: string;
  to: string;
  piece: ChessPiece;
  captured: ChessPiece | null;
  promotion?: PieceType;
}

export class ChessGame extends IGame {
  readonly GAME_ID = 'chess';
  readonly GAME_NAME = 'Royal Chess';
  readonly GAME_NAME_AR = 'الشطرنج الملكي';
  readonly MIN_PLAYERS = 2;
  readonly MAX_PLAYERS = 2;
  readonly ROUND_TIMEOUT_MS = 30 * 60 * 1000;

  private board: (ChessPiece | null)[][] = [];
  private playerColors: Record<string, PieceColor> = {};
  private moveHistory: ChessMoveRecord[] = [];
  private enPassantTarget: string | null = null;
  private kingPositions: Record<PieceColor, string> = { white: 'e1', black: 'e8' };
  private inCheck: Record<PieceColor, boolean> = { white: false, black: false };

  initGame(options: GameStartOptions): Record<string, any> {
    this._players = options.playerIds;
    this._currentPlayerIndex = 0;
    this.moveHistory = [];
    this.enPassantTarget = null;

    this.playerColors[this._players[0]] = 'white';
    this.playerColors[this._players[1]] = 'black';

    this.kingPositions = { white: 'e1', black: 'e8' };
    this.inCheck = { white: false, black: false };

    this.initBoard();
    this._state = { phase: 'playing' };

    return this.getStateForPlayer(null as any);
  }

  handleMove(playerId: PlayerId, action: string, data: Record<string, any>): GameStateUpdate {
    if (playerId !== this.getCurrentPlayer()) {
      throw new Error('NOT_YOUR_TURN');
    }

    if (action === 'move') {
      return this.processMove(playerId, data);
    }

    if (action === 'resign') {
      this._state.phase = 'finished';
      return {
        type: 'game_over',
        data: { winner: this.getOpponent(playerId), reason: 'resignation' },
      };
    }

    throw new Error('INVALID_ACTION');
  }

  private processMove(playerId: string, data: Record<string, any>): GameStateUpdate {
    const { from, to } = data;
    const color = this.playerColors[playerId];

    const fromRow = 8 - parseInt(from[1]);
    const fromCol = from.charCodeAt(0) - 97;
    const toRow = 8 - parseInt(to[1]);
    const toCol = to.charCodeAt(0) - 97;

    const piece = this.board[fromRow][fromCol];
    if (!piece || piece.color !== color) {
      throw new Error('NO_PIECE_HERE');
    }

    const target = this.board[toRow][toCol];
    if (target && target.color === color) {
      throw new Error('CANNOT_CAPTURE_OWN');
    }

    if (!this.isValidPieceMove(piece, fromRow, fromCol, toRow, toCol)) {
      throw new Error('INVALID_MOVE');
    }

    if (this.wouldBeInCheck(fromRow, fromCol, toRow, toCol, color)) {
      throw new Error('MOVE_LEAVES_IN_CHECK');
    }

    const captured = target;

    const moveRecord: ChessMoveRecord = {
      from,
      to,
      piece: { ...piece },
      captured: captured ? { ...captured } : null,
    };

    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;
    piece.hasMoved = true;

    if (piece.type === 'king') {
      this.kingPositions[color] = to;
    }

    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      piece.type = 'queen';
      moveRecord.promotion = 'queen';
    }

    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      this.enPassantTarget = `${String.fromCharCode(97 + fromCol)}${8 - (fromRow + toRow) / 2}`;
    } else {
      this.enPassantTarget = null;
    }

    this.moveHistory.push(moveRecord);

    const opponent = this.getOpponent(playerId);
    const opponentColor = this.playerColors[opponent];
    this.inCheck[opponentColor] = this.isKingInCheck(opponentColor);

    const isCheckmate = this.inCheck[opponentColor] && !this.hasLegalMoves(opponentColor);
    const isStalemate = !this.inCheck[opponentColor] && !this.hasLegalMoves(opponentColor);

    if (isCheckmate) {
      this._state.phase = 'finished';
      return {
        type: 'checkmate',
        data: { winner: playerId, loser: opponent, reason: 'checkmate' },
      };
    }

    if (isStalemate) {
      this._state.phase = 'finished';
      return {
        type: 'stalemate',
        data: { winner: null, reason: 'stalemate' },
      };
    }

    const nextPlayer = this.advanceTurn();

    return {
      type: 'move_made',
      data: {
        playerId,
        from,
        to,
        piece: piece.type,
        captured: captured?.type || null,
        promotion: moveRecord.promotion || null,
        check: this.inCheck[opponentColor],
        currentPlayer: nextPlayer,
      },
    };
  }

  getStateForPlayer(_playerId: PlayerId): Record<string, any> {
    return {
      board: this.board,
      currentPlayer: this.getCurrentPlayer(),
      playerColors: this.playerColors,
      moveHistory: this.moveHistory,
      inCheck: this.inCheck,
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

  private initBoard(): void {
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));

    const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    for (let col = 0; col < 8; col++) {
      this.board[0][col] = { type: backRow[col], color: 'white', hasMoved: false };
      this.board[1][col] = { type: 'pawn', color: 'white', hasMoved: false };
      this.board[6][col] = { type: 'pawn', color: 'black', hasMoved: false };
      this.board[7][col] = { type: backRow[col], color: 'black', hasMoved: false };
    }
  }

  private isValidPieceMove(piece: ChessPiece, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const dRow = toRow - fromRow;
    const dCol = toCol - fromCol;
    const absRow = Math.abs(dRow);
    const absCol = Math.abs(dCol);

    switch (piece.type) {
      case 'pawn':
        return this.isValidPawnMove(piece, fromRow, fromCol, toRow, toCol, dRow, dCol, absRow, absCol);
      case 'rook':
        return (dRow === 0 || dCol === 0) && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case 'bishop':
        return absRow === absCol && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case 'queen':
        return ((dRow === 0 || dCol === 0) || (absRow === absCol)) && this.isPathClear(fromRow, fromCol, toRow, toCol);
      case 'knight':
        return (absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2);
      case 'king':
        return absRow <= 1 && absCol <= 1;
      default:
        return false;
    }
  }

  private isValidPawnMove(
    piece: ChessPiece, fromRow: number, fromCol: number,
    toRow: number, toCol: number,
    dRow: number, dCol: number, absRow: number, absCol: number,
  ): boolean {
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 1 : 6;

    if (dCol === 0) {
      if (dRow === direction && !this.board[toRow][toCol]) return true;
      if (fromRow === startRow && dRow === direction * 2 &&
        !this.board[fromRow + direction][fromCol] && !this.board[toRow][toCol]) return true;
    }

    if (absCol === 1 && dRow === direction) {
      if (this.board[toRow][toCol]) return true;
      if (this.enPassantTarget === `${String.fromCharCode(97 + toCol)}${8 - toRow}`) return true;
    }

    return false;
  }

  private isPathClear(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const dRow = Math.sign(toRow - fromRow);
    const dCol = Math.sign(toCol - fromCol);

    let row = fromRow + dRow;
    let col = fromCol + dCol;

    while (row !== toRow || col !== toCol) {
      if (this.board[row][col]) return false;
      row += dRow;
      col += dCol;
    }

    return true;
  }

  private wouldBeInCheck(fromRow: number, fromCol: number, toRow: number, toCol: number, color: PieceColor): boolean {
    const piece = this.board[fromRow][fromCol];
    const target = this.board[toRow][toCol];

    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    const inCheck = this.isKingInCheck(color);

    this.board[fromRow][fromCol] = piece;
    this.board[toRow][toCol] = target;

    return inCheck;
  }

  private isKingInCheck(color: PieceColor): boolean {
    const kingPos = this.kingPositions[color];
    const kingRow = 8 - parseInt(kingPos[1]);
    const kingCol = kingPos.charCodeAt(0) - 97;

    const opponent = color === 'white' ? 'black' : 'white';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === opponent) {
          if (this.isValidPieceMove(piece, row, col, kingRow, kingCol)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private hasLegalMoves(color: PieceColor): boolean {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== color) continue;

        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (fromRow === toRow && fromCol === toCol) continue;
            const target = this.board[toRow][toCol];
            if (target && target.color === color) continue;
            if (!this.isValidPieceMove(piece, fromRow, fromCol, toRow, toCol)) continue;
            if (this.wouldBeInCheck(fromRow, fromCol, toRow, toCol, color)) continue;
            return true;
          }
        }
      }
    }
    return false;
  }

  private getOpponent(playerId: string): string {
    return this._players.find(p => p !== playerId)!;
  }
}
