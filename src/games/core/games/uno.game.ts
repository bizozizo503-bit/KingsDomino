import { IGame, GameStartOptions, GameStateUpdate, PlayerId } from '../game.interface';

type UnoCard = {
  rank: string;
  color: string;
};

export class UnoGame extends IGame {
  readonly GAME_ID = 'uno';
  readonly GAME_NAME = 'Royal Uno';
  readonly GAME_NAME_AR = 'يونو الملكي';
  readonly MIN_PLAYERS = 2;
  readonly MAX_PLAYERS = 6;
  readonly ROUND_TIMEOUT_MS = 15 * 60 * 1000;

  private hands: Record<string, UnoCard[]> = {};
  private deck: UnoCard[] = [];
  private discardPile: UnoCard[] = [];
  private currentColor: string = 'red';
  private direction: 1 | -1 = 1;

  initGame(options: GameStartOptions): Record<string, any> {
    this._players = options.playerIds;
    this._currentPlayerIndex = 0;
    this.direction = 1;

    this.deck = this.createDeck();
    this.deck = this.shuffle(this.deck);
    this.discardPile = [];
    this.hands = {};

    for (const playerId of this._players) {
      this.hands[playerId] = [];
      for (let i = 0; i < 7; i++) {
        this.hands[playerId].push(this.deck.pop()!);
      }
    }

    let firstCard = this.deck.pop()!;
    while (firstCard.rank === 'wild' || firstCard.rank === 'wild4') {
      this.deck.unshift(firstCard);
      firstCard = this.deck.pop()!;
    }

    this.discardPile.push(firstCard);
    this.currentColor = firstCard.color;
    this._state = { phase: 'playing' };

    return this.getStateForPlayer(null as any);
  }

  handleMove(playerId: PlayerId, action: string, data: Record<string, any>): GameStateUpdate {
    if (playerId !== this.getCurrentPlayer()) {
      throw new Error('NOT_YOUR_TURN');
    }

    if (action === 'play_card') {
      return this.handlePlayCard(playerId, data);
    }

    if (action === 'draw_card') {
      return this.handleDrawCard(playerId);
    }

    if (action === 'call_uno') {
      return { type: 'uno_called', data: { playerId } };
    }

    throw new Error('INVALID_ACTION');
  }

  private handlePlayCard(playerId: string, data: Record<string, any>): GameStateUpdate {
    const cardIndex = data.cardIndex;
    const hand = this.hands[playerId];
    const card = hand[cardIndex];

    if (!card) throw new Error('INVALID_CARD');

    const topCard = this.discardPile[this.discardPile.length - 1];
    if (!this.canPlay(card, topCard)) {
      throw new Error('INVALID_PLAY');
    }

    hand.splice(cardIndex, 1);

    if (data.colorChoice && (card.rank === 'wild' || card.rank === 'wild4')) {
      this.currentColor = data.colorChoice;
    } else if (card.color !== 'wild') {
      this.currentColor = card.color;
    }

    this.discardPile.push(card);

    if (hand.length === 0) {
      this._state.phase = 'finished';
      return {
        type: 'game_over',
        data: { winner: playerId, reason: 'empty_hand' },
      };
    }

    if (card.rank === 'skip') {
      this.advanceTurn();
    }

    if (card.rank === 'reverse') {
      this.direction = (this.direction === 1 ? -1 : 1) as 1 | -1;
      if (this._players.length === 2) {
        this.advanceTurn();
      }
    }

    if (card.rank === 'draw2') {
      const nextIdx = this.getNextPlayerIndex();
      const nextPlayer = this._players[nextIdx];
      for (let i = 0; i < 2; i++) {
        this.hands[nextPlayer].push(this.deck.pop()!);
      }
    }

    if (card.rank === 'wild4') {
      const nextIdx = this.getNextPlayerIndex();
      const nextPlayer = this._players[nextIdx];
      for (let i = 0; i < 4; i++) {
        this.hands[nextPlayer].push(this.deck.pop()!);
      }
    }

    const nextPlayer = this.advanceTurn();

    return {
      type: 'card_played',
      data: {
        playerId,
        card,
        currentColor: this.currentColor,
        currentPlayer: nextPlayer,
        handsCount: this.getHandsCount(),
      },
    };
  }

  private handleDrawCard(playerId: string): GameStateUpdate {
    const drawnCard = this.deck.pop()!;
    this.hands[playerId].push(drawnCard);

    const nextPlayer = this.advanceTurn();

    return {
      type: 'card_drawn',
      data: {
        playerId,
        currentPlayer: nextPlayer,
        handsCount: this.getHandsCount(),
      },
    };
  }

  private canPlay(card: UnoCard, topCard: UnoCard): boolean {
    if (card.rank === 'wild' || card.rank === 'wild4') return true;
    if (card.color === this.currentColor) return true;
    if (card.rank === topCard.rank) return true;
    return false;
  }

  private getNextPlayerIndex(): number {
    let next = this._currentPlayerIndex + this.direction;
    if (next >= this._players.length) next = 0;
    if (next < 0) next = this._players.length - 1;
    return next;
  }

  getStateForPlayer(_playerId: PlayerId): Record<string, any> {
    return {
      topCard: this.discardPile[this.discardPile.length - 1],
      currentColor: this.currentColor,
      currentPlayer: this.getCurrentPlayer(),
      deckSize: this.deck.length,
      handsCount: this.getHandsCount(),
      phase: this._state.phase,
      direction: this.direction,
    };
  }

  isGameOver(): boolean {
    return this._state.phase === 'finished';
  }

  getResult(): any {
    const scores: Record<string, number> = {};
    const winnerId = this._state.winner;

    for (const playerId of this._players) {
      if (playerId === winnerId) {
        scores[playerId] = 100;
      } else {
        let penalty = 0;
        for (const card of this.hands[playerId] || []) {
          if (card.rank === 'wild' || card.rank === 'wild4') penalty += 50;
          else if (['skip', 'reverse', 'draw2'].includes(card.rank)) penalty += 20;
          else penalty += parseInt(card.rank) || 10;
        }
        scores[playerId] = Math.max(0, -penalty);
      }
    }

    return {
      winner: winnerId || null,
      scores,
      rewards: this.calculateRewards(scores),
      finishedAt: Date.now(),
      reason: 'normal',
    };
  }

  private getHandsCount(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [pid, hand] of Object.entries(this.hands)) {
      counts[pid] = hand.length;
    }
    return counts;
  }

  private createDeck(): UnoCard[] {
    const deck: UnoCard[] = [];
    const colors = ['red', 'blue', 'green', 'yellow'];
    const ranks = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];

    for (const color of colors) {
      deck.push({ rank: '0', color });
      for (let i = 0; i < 2; i++) {
        for (const rank of ranks) {
          if (rank === '0') continue;
          deck.push({ rank, color });
        }
      }
    }

    for (let i = 0; i < 4; i++) {
      deck.push({ rank: 'wild', color: 'wild' });
      deck.push({ rank: 'wild4', color: 'wild' });
    }

    return deck;
  }

  private shuffle(deck: UnoCard[]): UnoCard[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
