import { Injectable, Logger } from '@nestjs/common';
import { IGame } from './game.interface';
import { DominoGame } from './games/domino.game';
import { LudoGame } from './games/ludo.game';
import { ChessGame } from './games/chess.game';
import { BackgammonGame } from './games/backgammon.game';
import { UnoGame } from './games/uno.game';
import { PoolGame } from './games/pool.game';
import { BingoGame } from './games/bingo.game';
import { BalootGame } from './games/baloot.game';

export interface GameRegistration {
  gameId: string;
  factory: () => IGame;
  metadata: {
    name: string;
    nameAr: string;
    category: string;
    minPlayers: number;
    maxPlayers: number;
    isRanked: boolean;
    icon: string;
    description: string;
  };
}

@Injectable()
export class GameRegistry {
  private readonly logger = new Logger(GameRegistry.name);
  private readonly games = new Map<string, GameRegistration>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    const defaultGames: GameRegistration[] = [
      {
        gameId: 'domino',
        factory: () => new DominoGame(),
        metadata: {
          name: 'Royal Domino',
          nameAr: 'الدومينو الملكي',
          category: 'board',
          minPlayers: 2,
          maxPlayers: 4,
          isRanked: true,
          icon: 'domino',
          description: 'Classic domino game with multiple variants',
        },
      },
      {
        gameId: 'ludo',
        factory: () => new LudoGame(),
        metadata: {
          name: 'Royal Ludo',
          nameAr: 'لودو الملكي',
          category: 'board',
          minPlayers: 2,
          maxPlayers: 4,
          isRanked: true,
          icon: 'ludo',
          description: 'Classic Ludo board game',
        },
      },
      {
        gameId: 'chess',
        factory: () => new ChessGame(),
        metadata: {
          name: 'Royal Chess',
          nameAr: 'الشطرنج الملكي',
          category: 'board',
          minPlayers: 2,
          maxPlayers: 2,
          isRanked: true,
          icon: 'chess',
          description: 'Classic chess with full rules',
        },
      },
      {
        gameId: 'backgammon',
        factory: () => new BackgammonGame(),
        metadata: {
          name: 'Royal Backgammon',
          nameAr: 'الطاولة الملكية',
          category: 'board',
          minPlayers: 2,
          maxPlayers: 2,
          isRanked: true,
          icon: 'backgammon',
          description: 'Classic backgammon (Tawla)',
        },
      },
      {
        gameId: 'baloot',
        factory: () => new BalootGame(),
        metadata: {
          name: 'Royal Baloot',
          nameAr: 'البلوت الملكي',
          category: 'card',
          minPlayers: 4,
          maxPlayers: 4,
          isRanked: true,
          icon: 'baloot',
          description: 'Arabic trick-taking card game',
        },
      },
      {
        gameId: 'uno',
        factory: () => new UnoGame(),
        metadata: {
          name: 'Royal Uno',
          nameAr: 'يونو الملكي',
          category: 'card',
          minPlayers: 2,
          maxPlayers: 6,
          isRanked: true,
          icon: 'uno',
          description: 'Classic Uno card game',
        },
      },
      {
        gameId: 'pool',
        factory: () => new PoolGame(),
        metadata: {
          name: 'Royal Pool',
          nameAr: 'البلياردو الملكي',
          category: 'sport',
          minPlayers: 2,
          maxPlayers: 2,
          isRanked: true,
          icon: 'pool',
          description: '8-ball pool game',
        },
      },
      {
        gameId: 'bingo',
        factory: () => new BingoGame(),
        metadata: {
          name: 'Royal Bingo',
          nameAr: 'البينجو الملكي',
          category: 'casual',
          minPlayers: 1,
          maxPlayers: 100,
          isRanked: false,
          icon: 'bingo',
          description: 'Classic bingo game',
        },
      },
    ];

    for (const game of defaultGames) {
      this.register(game);
    }
  }

  register(registration: GameRegistration): void {
    if (this.games.has(registration.gameId)) {
      this.logger.warn(`Game ${registration.gameId} already registered, overwriting`);
    }

    this.games.set(registration.gameId, registration);
    this.logger.log(`Registered game: ${registration.gameId} (${registration.metadata.name})`);
  }

  getGame(gameId: string): GameRegistration | undefined {
    return this.games.get(gameId);
  }

  createGameInstance(gameId: string): IGame {
    const registration = this.games.get(gameId);
    if (!registration) {
      throw new Error(`Game ${gameId} not found`);
    }
    return registration.factory();
  }

  getAllGames(): GameRegistration[] {
    return Array.from(this.games.values());
  }

  getGameIds(): string[] {
    return Array.from(this.games.keys());
  }

  isRegistered(gameId: string): boolean {
    return this.games.has(gameId);
  }

  getGamesByCategory(category: string): GameRegistration[] {
    return this.getAllGames().filter(g => g.metadata.category === category);
  }
}
