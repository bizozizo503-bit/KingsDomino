import { IGame, GameStartOptions, GameStateUpdate, PlayerId } from '../game.interface';

export class DominoGame extends IGame {
  readonly GAME_ID = 'domino';
  readonly GAME_NAME = 'Royal Domino';
  readonly GAME_NAME_AR = 'الدومينو الملكي';
  readonly MIN_PLAYERS = 2;
  readonly MAX_PLAYERS = 4;
  readonly ROUND_TIMEOUT_MS = 10 * 60 * 1000;

  private board: { left: number; right: number }[] = [];
  private hands: Record<string, { left: number; right: number }[]> = {};
  private deck: { left: number; right: number }[] = [];

  initGame(options: GameStartOptions): Record<string, any> {
    this._players = options.playerIds;
    this._currentPlayerIndex = 0;

    this.deck = this.createDeck();
    this.deck = this.shuffle(this.deck);

    const tilesPerPlayer = this._players.length === 2 ? 9 : 7;
    this.hands = {};

    for (const playerId of this._players) {
      this.hands[playerId] = this.deck.splice(0, tilesPerPlayer);
    }

    this.board = [];
    this._state = { phase: 'playing' };

    return this.getStateForPlayer(null as any);
  }

  handleMove(playerId: PlayerId, action: string, data: Record<string, any>): GameStateUpdate {
    if (playerId !== this.getCurrentPlayer()) {
      throw new Error('NOT_YOUR_TURN');
    }

    if (action === 'play_tile') {
      return this.handlePlayTile(playerId, data);
    }

    if (action === 'draw') {
      return this.handleDraw(playerId);
    }

    if (action === 'pass') {
      return this.handlePass(playerId);
    }

    throw new Error('INVALID_ACTION');
  }

  private handlePlayTile(playerId: string, data: Record<string, any>): GameStateUpdate {
    const tileIndex = data.tileIndex;
    const hand = this.hands[playerId];
    const tile = hand?.[tileIndex];

    if (!tile) {
      throw new Error('INVALID_TILE');
    }

    const side = this.getPlacementSide(tile);
    if (!side) {
      throw new Error('INVALID_PLACEMENT');
    }

    const orientedTile = this.orientTile(tile, side);
    hand.splice(tileIndex, 1);

    if (side === 'left') {
      this.board.unshift(orientedTile);
    } else {
      this.board.push(orientedTile);
    }

    if (hand.length === 0) {
      this._state.phase = 'finished';
      return {
        type: 'game_over',
        data: {
          winner: playerId,
          board: this.board,
          hands: this.getPublicHands(),
          reason: 'normal',
        },
      };
    }

    const nextPlayer = this.advanceTurn();
    const skippedPlayers = this.getSkippedPlayers();

    return {
      type: 'tile_played',
      data: {
        playerId,
        tile: orientedTile,
        side,
        board: this.board,
        currentPlayer: nextPlayer,
        handsCount: this.getHandsCount(),
        skippedPlayers,
        hands: this.getPublicHands(),
      },
    };
  }

  private handleDraw(playerId: string): GameStateUpdate {
    if (this.deck.length === 0) {
      throw new Error('NO_TILES_TO_DRAW');
    }

    const tile = this.deck.pop()!;
    this.hands[playerId].push(tile);

    const hand = this.hands[playerId];
    const leftEnd = this.board.length > 0 ? this.board[0].left : -1;
    const rightEnd = this.board.length > 0 ? this.board[this.board.length - 1].right : -1;

    const canPlay = this.board.length === 0 || this.hasPlayableTile(hand, leftEnd, rightEnd);

    if (!canPlay) {
      const nextPlayer = this.advanceTurn();
      return {
        type: 'drew_and_passed',
        data: {
          playerId,
          newTileCount: 1,
          currentPlayer: nextPlayer,
          handsCount: this.getHandsCount(),
          board: this.board,
        },
      };
    }

    return {
      type: 'drew_tile',
      data: {
        playerId,
        newTileCount: 1,
        currentPlayer: playerId,
        handsCount: this.getHandsCount(),
        board: this.board,
      },
    };
  }

  private handlePass(playerId: string): GameStateUpdate {
    const hand = this.hands[playerId];
    const leftEnd = this.board.length > 0 ? this.board[0].left : -1;
    const rightEnd = this.board.length > 0 ? this.board[this.board.length - 1].right : -1;

    if (this.board.length > 0 && this.hasPlayableTile(hand, leftEnd, rightEnd)) {
      throw new Error('YOU_CAN_PLAY');
    }

    if (this.deck.length > 0) {
      throw new Error('MUST_DRAW');
    }

    const nextPlayer = this.advanceTurn();
    const skippedPlayers = this.getSkippedPlayers();

    if (skippedPlayers.length === this._players.length) {
      this._state.phase = 'finished';
      return {
        type: 'game_over',
        data: {
          winner: null,
          board: this.board,
          hands: this.getPublicHands(),
          reason: 'blocked',
        },
      };
    }

    return {
      type: 'player_passed',
      data: {
        playerId,
        currentPlayer: nextPlayer,
        skippedPlayers,
        board: this.board,
      },
    };
  }

  getStateForPlayer(_playerId: PlayerId): Record<string, any> {
    return {
      board: this.board,
      hands: this.getPublicHands(),
      currentPlayer: this.getCurrentPlayer(),
      deckSize: this.deck.length,
      phase: this._state.phase,
    };
  }

  isGameOver(): boolean {
    return this._state.phase === 'finished';
  }

  getResult(): any {
    const scores: Record<string, number> = {};
    let winner: string | null = null;

    for (const [playerId, hand] of Object.entries(this.hands)) {
      scores[playerId] = hand.length;
      if (hand.length === 0) {
        winner = playerId;
      }
    }

    const finalScores: Record<string, number> = {};

    for (const [playerId, count] of Object.entries(scores)) {
      if (playerId === winner) {
        finalScores[playerId] = 100;
      } else {
        finalScores[playerId] = Math.max(0, 100 - count * 10);
      }
    }

    return {
      winner,
      scores: finalScores,
      rewards: this.calculateRewards(finalScores),
      finishedAt: Date.now(),
      reason: 'normal',
    };
  }

  private getPublicHands(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [playerId, hand] of Object.entries(this.hands)) {
      counts[playerId] = hand.length;
    }
    return counts;
  }

  private getHandsCount(): Record<string, number> {
    return this.getPublicHands();
  }

  private getSkippedPlayers(): string[] {
    const leftEnd = this.board.length > 0 ? this.board[0].left : -1;
    const rightEnd = this.board.length > 0 ? this.board[this.board.length - 1].right : -1;
    const skipped: string[] = [];

    for (const playerId of this._players) {
      if (playerId === this.getCurrentPlayer()) continue;
      const hand = this.hands[playerId];
      if (hand.length === 0 || !this.hasPlayableTile(hand, leftEnd, rightEnd)) {
        skipped.push(playerId);
      }
    }

    return skipped;
  }

  private createDeck(): { left: number; right: number }[] {
    const deck: { left: number; right: number }[] = [];
    for (let left = 0; left <= 6; left++) {
      for (let right = left; right <= 6; right++) {
        deck.push({ left, right });
      }
    }
    return deck;
  }

  private shuffle(deck: { left: number; right: number }[]): { left: number; right: number }[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getPlacementSide(tile: { left: number; right: number }): 'left' | 'right' | null {
    if (this.board.length === 0) return 'right';

    const leftEnd = this.board[0].left;
    const rightEnd = this.board[this.board.length - 1].right;

    const matchesRight = tile.left === rightEnd || tile.right === rightEnd;
    const matchesLeft = tile.left === leftEnd || tile.right === leftEnd;

    if (matchesRight) return 'right';
    if (matchesLeft) return 'left';
    return null;
  }

  private orientTile(tile: { left: number; right: number }, side: 'left' | 'right'): { left: number; right: number } {
    if (this.board.length === 0) return tile;

    if (side === 'right') {
      const rightEnd = this.board[this.board.length - 1].right;
      if (tile.left === rightEnd) return tile;
      return { left: tile.right, right: tile.left };
    }

    const leftEnd = this.board[0].left;
    if (tile.right === leftEnd) return tile;
    return { left: tile.right, right: tile.left };
  }

  private hasPlayableTile(
    hand: { left: number; right: number }[],
    leftEnd: number,
    rightEnd: number,
  ): boolean {
    return hand.some(tile =>
      tile.left === leftEnd || tile.right === leftEnd ||
      tile.left === rightEnd || tile.right === rightEnd
    );
  }
}
