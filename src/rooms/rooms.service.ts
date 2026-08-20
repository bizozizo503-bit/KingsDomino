import { BadRequestException, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Domino } from '../game/domino.interface';
import { DominoService } from '../game/domino.service';
import { PublicRoomDto } from './dto/room-response.dto';

export interface GameState {
  players: string[];
  dominoDeck: any[];
  started: boolean;
  currentPlayer: string;
  board: any[];
  hands: Record<string, any[]>;
  finishReason?: 'normal' | 'blocked';
  winner?: string | null;
  scores?: Record<string, number>;
  sessionId?: string;
}

export interface Room {
  code: string;
  name: string;
  maxPlayers: number;
  host: string;
  status: 'waiting' | 'playing' | 'finished';
  players: string[];
  playerNames: Record<string, string>;
  started: boolean;
  gameState: GameState;
  createdAt: number;
  lastActivity: number;
}

@Injectable()
export class RoomsService implements OnModuleDestroy {
  private rooms = new Map<string, Room>();
  private disconnectedTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private readonly logger = new Logger(RoomsService.name);

  private readonly ROOM_FINISHED_TTL_MS = 10 * 60 * 1000;
  private readonly ROOM_IDLE_TTL_MS = 30 * 60 * 1000;
  private readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
  private readonly PLAYER_DISCONNECT_TIMEOUT_MS = 60 * 1000;

  private onPlayerRemovedHandler: ((
    code: string,
    playerId: string,
    reason: 'disconnect' | 'leave',
  ) => void) | null = null;

  constructor(private readonly dominoService: DominoService) {
    this.cleanupTimer = setInterval(
      () => this.cleanup(),
      this.CLEANUP_INTERVAL_MS,
    );
  }

  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    for (const timer of this.disconnectedTimers.values()) {
      clearTimeout(timer);
    }
    this.disconnectedTimers.clear();
  }

  setPlayerRemovedHandler(
    handler: (code: string, playerId: string, reason: 'disconnect' | 'leave') => void,
  ): void {
    this.onPlayerRemovedHandler = handler;
  }

  create(data: {
    name: string;
    players: number;
    host: string;
    status: string;
  }): Room {
    const code = this.generateUniqueCode();
    const now = Date.now();

    const room: Room = {
      code,
      name: data.name,
      maxPlayers: Math.min(Math.max(data.players, 2), 4),
      host: data.host,
      status: 'waiting',
      players: [],
      playerNames: {},
      started: false,
      gameState: {
        players: [],
        dominoDeck: [],
        started: false,
        currentPlayer: '',
        board: [],
        hands: {},
      },
      createdAt: now,
      lastActivity: now,
    };

    this.rooms.set(code, room);
    return room;
  }

  findAll(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoom(code: string): Room | undefined {
    return this.findByCode(code);
  }

  findByCode(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  toPublicRoom(room: Room): PublicRoomDto {
    return {
      code: room.code,
      name: room.name,
      maxPlayers: room.maxPlayers,
      host: room.host,
      status: room.status,
      players: [...room.players],
      playerNames: { ...room.playerNames },
      started: room.started,
      gameState: {
        started: room.gameState.started,
        currentPlayer: room.gameState.currentPlayer,
        board: room.gameState.board.map((tile) => ({ ...tile })),
        finishReason: room.gameState.finishReason,
      },
    };
  }

  joinRoom(code: string, playerId: string, name: string): Room {
    const room = this.findByCode(code);

    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }

    if (room.started) {
      throw new Error('GAME_ALREADY_STARTED');
    }

    if (!playerId || playerId.trim() === '') {
      throw new Error('INVALID_PLAYER');
    }

    const timerKey = `${code}:${playerId}`;
    if (this.disconnectedTimers.has(timerKey)) {
      clearTimeout(this.disconnectedTimers.get(timerKey)!);
      this.disconnectedTimers.delete(timerKey);
    }

    if (!room.players.includes(playerId)) {
      if (room.players.length >= room.maxPlayers) {
        throw new Error('ROOM_FULL');
      }

      room.players.push(playerId);
      room.gameState.players.push(playerId);
    }

    room.playerNames[playerId] = name;
    room.lastActivity = Date.now();

    return room;
  }

  startGame(code: string, userId: string): Room {
    const room = this.findByCode(code);

    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }

    if (room.host !== userId) {
      throw new Error('NOT_HOST');
    }

    if (room.players.length < 2) {
      throw new Error('NEED_TWO_PLAYERS');
    }

    if (room.started) {
      return room;
    }

    let deck = this.dominoService.createDeck();
    deck = this.dominoService.shuffle(deck);

    room.gameState.dominoDeck = deck;
    room.gameState.board = [];
    room.gameState.hands = {};

    for (const playerId of room.players) {
      room.gameState.hands[playerId] =
        room.gameState.dominoDeck.splice(0, 7);
    }

    room.started = true;
    room.status = 'playing';
    room.gameState.started = true;
    room.gameState.currentPlayer = room.players[0];
    room.lastActivity = Date.now();

    return room;
  }

  playDomino(
    code: string,
    playerId: string,
    tileIndex: number,
  ) {
    const room = this.findByCode(code);

    if (!room || !room.started) {
      throw new Error('GAME_NOT_STARTED');
    }

    if (room.gameState.currentPlayer !== playerId) {
      throw new Error('NOT_YOUR_TURN');
    }

    const hand = room.gameState.hands[playerId] || [];
    const tile = hand[tileIndex];

    if (!tile) {
      throw new Error('INVALID_TILE');
    }

    const side = this.getPlacementSide(room.gameState.board, tile);
    if (!side) {
      throw new BadRequestException('INVALID_PLACEMENT');
    }

    const orientedTile = this.orientTile(tile, side, room.gameState.board);

    hand.splice(tileIndex, 1);

    if (side === 'left') {
      room.gameState.board.unshift(orientedTile);
    } else {
      room.gameState.board.push(orientedTile);
    }

    if (hand.length === 0) {
      room.status = 'finished';
      room.started = false;
      room.gameState.started = false;
      room.gameState.finishReason = 'normal';
      room.gameState.currentPlayer = '';
      room.gameState.winner = playerId;
      room.gameState.scores = this.computeScores(room);
      room.lastActivity = Date.now();

      return {
        room,
        tile: orientedTile,
        winner: playerId,
        skippedPlayers: [],
        blocked: false,
        finishReason: 'normal' as const,
        scores: room.gameState.scores,
      };
    }

    const { skippedPlayers, blocked } = this.advanceTurn(room, playerId);

    if (blocked) {
      room.status = 'finished';
      room.started = false;
      room.gameState.started = false;
      room.gameState.finishReason = 'blocked';
      room.gameState.currentPlayer = '';
      room.gameState.scores = this.computeScores(room);
      room.gameState.winner = this.blockedWinner(room);
    }

    room.lastActivity = Date.now();

    return {
      room,
      tile: orientedTile,
      winner: room.gameState.winner ?? null,
      skippedPlayers,
      blocked,
      finishReason: blocked
        ? ('blocked' as const)
        : (room.gameState.finishReason ?? null),
      scores: room.gameState.scores ?? null,
    };
  }

  leaveRoom(code: string, playerId: string): Room | undefined {
    const room = this.findByCode(code);
    if (!room) return room;

    const timerKey = `${code}:${playerId}`;
    if (this.disconnectedTimers.has(timerKey)) {
      clearTimeout(this.disconnectedTimers.get(timerKey)!);
      this.disconnectedTimers.delete(timerKey);
    }

    this.removePlayer(code, playerId, 'leave');
    return room;
  }

  handleDisconnect(code: string, playerId: string): void {
    const room = this.findByCode(code);
    if (!room) return;

    if (!room.started) {
      this.removePlayer(code, playerId);
      return;
    }

    const timerKey = `${code}:${playerId}`;
    if (this.disconnectedTimers.has(timerKey)) return;

    const timer = setTimeout(() => {
      this.disconnectedTimers.delete(timerKey);
      this.removePlayer(code, playerId, 'disconnect');
    }, this.PLAYER_DISCONNECT_TIMEOUT_MS);

    this.disconnectedTimers.set(timerKey, timer);
  }

  private removePlayer(
    code: string,
    playerId: string,
    reason: 'disconnect' | 'leave' = 'disconnect',
  ): void {
    const room = this.findByCode(code);
    if (!room) return;

    const playerIndex = room.players.indexOf(playerId);
    if (playerIndex === -1) return;

    room.players.splice(playerIndex, 1);
    room.gameState.players = room.gameState.players.filter(p => p !== playerId);
    delete room.gameState.hands[playerId];
    delete room.playerNames[playerId];

    if (!room.started) {
      if (room.players.length === 0) {
        this.rooms.delete(code);
      }
      this.onPlayerRemovedHandler?.(code, playerId, reason);
      return;
    }

    if (room.players.length < 1) {
      room.status = 'finished';
      room.started = false;
      room.gameState.started = false;
      room.gameState.finishReason = 'blocked';
      room.gameState.winner = null;
      room.gameState.currentPlayer = '';
      this.onPlayerRemovedHandler?.(code, playerId, reason);
      return;
    }

    if (room.gameState.currentPlayer === playerId) {
      const newIndex = playerIndex % room.players.length;
      room.gameState.currentPlayer = room.players[newIndex];
      this.advancePastBlocked(room, newIndex);
    }

    if (room.players.length === 1) {
      room.status = 'finished';
      room.started = false;
      room.gameState.started = false;
      room.gameState.finishReason = 'normal';
      room.gameState.currentPlayer = '';
      room.gameState.winner = room.players[0];
      room.gameState.scores = this.computeScores(room);
    }

    room.lastActivity = Date.now();
    this.onPlayerRemovedHandler?.(code, playerId, reason);
  }

  private getPlacementSide(board: Domino[], tile: Domino): 'left' | 'right' | null {
    if (board.length === 0) return 'right';

    const leftEnd = board[0].left;
    const rightEnd = board[board.length - 1].right;

    const matchesRight = tile.left === rightEnd || tile.right === rightEnd;
    const matchesLeft = tile.left === leftEnd || tile.right === leftEnd;

    if (matchesRight) return 'right';
    if (matchesLeft) return 'left';
    return null;
  }

  private orientTile(tile: Domino, side: 'left' | 'right', board: Domino[]): Domino {
    if (board.length === 0) return tile;

    if (side === 'right') {
      const rightEnd = board[board.length - 1].right;
      if (tile.left === rightEnd) return tile;
      return this.dominoService.flip(tile);
    }

    const leftEnd = board[0].left;
    if (tile.right === leftEnd) return tile;
    return this.dominoService.flip(tile);
  }

  private advanceTurn(
    room: Room,
    justPlayedId: string,
  ): { skippedPlayers: string[]; blocked: boolean } {
    const skippedPlayers: string[] = [];
    const board = room.gameState.board;
    const leftEnd = board[0].left;
    const rightEnd = board[board.length - 1].right;

    let nextIndex =
      (room.players.indexOf(justPlayedId) + 1) % room.players.length;
    const startIndex = nextIndex;

    while (true) {
      const nextPlayer = room.players[nextIndex];
      const hand = room.gameState.hands[nextPlayer] || [];

      if (
        hand.length > 0 &&
        this.dominoService.hasPlayableTile(hand, leftEnd, rightEnd)
      ) {
        room.gameState.currentPlayer = nextPlayer;
        return { skippedPlayers, blocked: false };
      }

      skippedPlayers.push(nextPlayer);
      nextIndex = (nextIndex + 1) % room.players.length;

      if (nextIndex === startIndex) {
        return { skippedPlayers, blocked: true };
      }
    }
  }

  private computeScores(room: Room): Record<string, number> {
    const scores: Record<string, number> = {};
    for (const playerId of room.gameState.players) {
      const hand = room.gameState.hands[playerId] || [];
      scores[playerId] = hand.reduce(
        (sum, tile) => sum + (tile.left || 0) + (tile.right || 0),
        0,
      );
    }
    return scores;
  }

  private blockedWinner(room: Room): string | null {
    const scores = this.computeScores(room);
    const entries = Object.entries(scores).sort((a, b) => a[1] - b[1]);

    if (entries.length === 0) return null;
    if (entries.length === 1) return entries[0][0];

    const lowest = entries[0][1];
    const lowestPlayers = entries.filter(e => e[1] === lowest);

    return lowestPlayers.length === 1 ? lowestPlayers[0][0] : null;
  }

  private advancePastBlocked(room: Room, fromIndex: number): void {
    const board = room.gameState.board;
    if (board.length === 0) return;

    const leftEnd = board[0].left;
    const rightEnd = board[board.length - 1].right;

    let index = fromIndex;
    const startIndex = index;

    for (let i = 0; i < room.players.length; i++) {
      const player = room.players[index];
      const hand = room.gameState.hands[player] || [];

      if (
        hand.length > 0 &&
        this.dominoService.hasPlayableTile(hand, leftEnd, rightEnd)
      ) {
        room.gameState.currentPlayer = player;
        return;
      }

      index = (index + 1) % room.players.length;
    }

    if (startIndex === index) {
      room.status = 'finished';
      room.started = false;
      room.gameState.started = false;
      room.gameState.finishReason = 'blocked';
      room.gameState.currentPlayer = '';
      room.gameState.winner = this.blockedWinner(room);
      room.gameState.scores = this.computeScores(room);
    }
  }

  private generateUniqueCode(): string {
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      const code = randomBytes(3)
        .toString('hex')
        .toUpperCase();

      if (!this.rooms.has(code)) {
        return code;
      }
    }

    const code = randomBytes(6)
      .toString('hex')
      .toUpperCase()
      .slice(0, 6);

    this.logger.warn(
      `Room code collision after ${maxAttempts} attempts, using fallback: ${code}`,
    );
    return code;
  }

  private cleanup() {
    const now = Date.now();
    let removedCount = 0;

    for (const [code, room] of this.rooms) {
      let shouldRemove = false;

      if (room.status === 'finished') {
        if (now - room.lastActivity > this.ROOM_FINISHED_TTL_MS) {
          shouldRemove = true;
        }
      } else if (room.status === 'waiting' && room.players.length === 0) {
        if (now - room.createdAt > this.ROOM_IDLE_TTL_MS) {
          shouldRemove = true;
        }
      }

      if (shouldRemove) {
        this.rooms.delete(code);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.log(`Cleaned up ${removedCount} room(s)`);
    }
  }
}
