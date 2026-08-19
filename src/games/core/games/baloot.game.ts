import { IGame, GameStartOptions, GameStateUpdate, PlayerId } from '../game.interface';

type BalootSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
type BalootRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface BalootCard {
  suit: BalootSuit;
  rank: BalootRank;
}

interface Trick {
  cards: { playerId: PlayerId; card: BalootCard }[];
  winner: PlayerId;
  points: number;
}

export class BalootGame extends IGame {
  readonly GAME_ID = 'baloot';
  readonly GAME_NAME = 'Royal Baloot';
  readonly GAME_NAME_AR = 'البلوت الملكي';
  readonly MIN_PLAYERS = 4;
  readonly MAX_PLAYERS = 4;
  readonly ROUND_TIMEOUT_MS = 30 * 60 * 1000;

  private hands: Record<string, BalootCard[]> = {};
  private deck: BalootCard[] = [];
  private trumpSuit: BalootSuit | null = null;
  private tricks: Trick[] = [];
  private currentTrick: { playerId: PlayerId; card: BalootCard }[] = [];
  private trickLeadPlayer: string = '';
  private roundNumber = 0;
  private teamScores: Record<string, number> = { team0: 0, team1: 0 };

  initGame(options: GameStartOptions): Record<string, any> {
    this._players = options.playerIds;
    this._currentPlayerIndex = 0;

    this.deck = this.createDeck();
    this.deck = this.shuffle(this.deck);
    this.hands = {};
    this.tricks = [];
    this.currentTrick = [];
    this.roundNumber = 0;
    this.teamScores = { team0: 0, team1: 0 };

    this.dealCards();
    this.trickLeadPlayer = this._players[0];
    this._state = { phase: 'bidding' };

    return this.getStateForPlayer(null as any);
  }

  handleMove(playerId: PlayerId, action: string, data: Record<string, any>): GameStateUpdate {
    if (playerId !== this.getCurrentPlayer()) {
      throw new Error('NOT_YOUR_TURN');
    }

    if (action === 'bid') {
      return this.handleBid(playerId, data);
    }

    if (action === 'play_card') {
      return this.handlePlayCard(playerId, data);
    }

    throw new Error('INVALID_ACTION');
  }

  private handleBid(playerId: string, data: Record<string, any>): GameStateUpdate {
    const { trumpSuit } = data;

    if (!['spades', 'hearts', 'diamonds', 'clubs', 'pass'].includes(trumpSuit)) {
      throw new Error('INVALID_BID');
    }

    if (trumpSuit === 'pass') {
      const nextPlayer = this.advanceTurn();
      return {
        type: 'bid_passed',
        data: { playerId, currentPlayer: nextPlayer },
      };
    }

    this.trumpSuit = trumpSuit as BalootSuit;
    this._state.phase = 'playing';
    this.trickLeadPlayer = playerId;

    return {
      type: 'trump_selected',
      data: {
        playerId,
        trumpSuit: this.trumpSuit,
        currentPlayer: playerId,
      },
    };
  }

  private handlePlayCard(playerId: string, data: Record<string, any>): GameStateUpdate {
    const { cardIndex } = data;
    const hand = this.hands[playerId];
    const card = hand[cardIndex];

    if (!card) throw new Error('INVALID_CARD');

    hand.splice(cardIndex, 1);
    this.currentTrick.push({ playerId, card });

    if (this.currentTrick.length === 4) {
      return this.resolveTrick();
    }

    const nextPlayer = this.advanceTurn();
    return {
      type: 'card_played',
      data: {
        playerId,
        card,
        currentPlayer: nextPlayer,
        trickSize: this.currentTrick.length,
      },
    };
  }

  private resolveTrick(): GameStateUpdate {
    const leadCard = this.currentTrick[0].card;
    let bestCard = leadCard;
    let winnerId = this.currentTrick[0].playerId;

    for (const { playerId, card } of this.currentTrick.slice(1)) {
      if (this.trumpSuit && card.suit === this.trumpSuit && bestCard.suit !== this.trumpSuit) {
        bestCard = card;
        winnerId = playerId;
      } else if (card.suit === bestCard.suit && this.cardRank(card) > this.cardRank(bestCard)) {
        bestCard = card;
        winnerId = playerId;
      }
    }

    const points = this.currentTrick.reduce((sum, { card }) => sum + this.cardPoints(card), 0);

    const trick: Trick = {
      cards: [...this.currentTrick],
      winner: winnerId,
      points,
    };

    this.tricks.push(trick);
    this.currentTrick = [];

    const team = this.getTeam(winnerId);
    this.teamScores[team] += points;

    if (this.hands[this._players[0]].length === 0) {
      this._state.phase = 'finished';

      const winningTeam = this.teamScores.team0 > this.teamScores.team1 ? 'team0' : 'team1';
      const winnerPlayer = winningTeam === 'team0' ? this._players[0] : this._players[2];

      return {
        type: 'game_over',
        data: {
          winner: winnerPlayer,
          teamScores: this.teamScores,
          reason: 'all_tricks_played',
        },
      };
    }

    this.trickLeadPlayer = winnerId;

    return {
      type: 'trick_resolved',
      data: {
        winner: winnerId,
        points,
        teamScores: this.teamScores,
        currentPlayer: winnerId,
        cardsRemaining: this.hands[this._players[0]].length,
      },
    };
  }

  private cardRank(card: BalootCard): number {
    const ranks: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14,
    };
    return ranks[card.rank] || 0;
  }

  private cardPoints(card: BalootCard): number {
    if (card.rank === 'A') return 11;
    if (card.rank === '10') return 10;
    if (card.rank === 'K') return 4;
    if (card.rank === 'Q') return 3;
    if (card.rank === 'J') return 2;
    return 0;
  }

  private getTeam(playerId: string): string {
    const idx = this._players.indexOf(playerId);
    return idx % 2 === 0 ? 'team0' : 'team1';
  }

  private dealCards(): void {
    for (const playerId of this._players) {
      this.hands[playerId] = [];
      for (let i = 0; i < 8; i++) {
        this.hands[playerId].push(this.deck.pop()!);
      }
    }
  }

  getStateForPlayer(_playerId: PlayerId): Record<string, any> {
    return {
      currentPlayer: this.getCurrentPlayer(),
      trumpSuit: this.trumpSuit,
      phase: this._state.phase,
      teamScores: this.teamScores,
      handsCount: this.getHandsCount(),
      currentTrickSize: this.currentTrick.length,
      trickLeadPlayer: this.trickLeadPlayer,
    };
  }

  isGameOver(): boolean {
    return this._state.phase === 'finished';
  }

  getResult(): any {
    const winnerId = this._state.winner;
    const scores: Record<string, number> = {};

    for (const playerId of this._players) {
      const team = this.getTeam(playerId);
      scores[playerId] = this.teamScores[team];
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

  private createDeck(): BalootCard[] {
    const deck: BalootCard[] = [];
    const suits: BalootSuit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
    const ranks: BalootRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }

    return deck;
  }

  private shuffle(deck: BalootCard[]): BalootCard[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
