import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DominoService } from '../game/domino.service';
import { Domino } from '../game/domino.interface';

export type BoardSide = 'left' | 'right';

export interface GameState {
  players: number[];
  dominoDeck: Domino[];
  started: boolean;
  currentPlayer: number;
  board: Domino[];
  hands: Record<string, Domino[]>;
}

export interface Room {
  code: string;
  name: string;
  maxPlayers: number;
  host: string;
  status: 'waiting' | 'playing' | 'finished';
  players: number[];
  playerNames: Record<string, string>;
  started: boolean;
  gameState: GameState;
}

@Injectable()
export class RoomsService {
  private rooms: Room[] = [];

  constructor(private readonly dominoService: DominoService) {}

  create(data: { name: string; players: number; host: string; status: string }): Room {
    let code = '';
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.findByCode(code));

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
        currentPlayer: 0,
        board: [],
        hands: {},
      },
    };

    this.rooms.push(room);
    return room;
  }

  findAll(): Room[] {
    return this.rooms;
  }

  findByCode(code: string): Room | undefined {
    return this.rooms.find((room) => room.code.toUpperCase() === code.toUpperCase());
  }

  joinRoom(code: string, playerId: number, name: string): Room {
    const room = this.findByCode(code);
    if (!room) throw new NotFoundException('الغرفة غير موجودة');
    if (room.started) throw new ConflictException('اللعبة بدأت بالفعل');
    if (!Number.isInteger(playerId) || playerId <= 0) throw new BadRequestException('اللاعب غير صحيح');

    if (!room.players.includes(playerId)) {
      if (room.players.length >= room.maxPlayers) throw new ConflictException('الغرفة ممتلئة');
      room.players.push(playerId);
      room.gameState.players.push(playerId);
    }

    room.playerNames[String(playerId)] = String(name || `Player${playerId}`).slice(0, 24);
    return room;
  }

  startGame(code: string): Room {
    const room = this.findByCode(code);
    if (!room) throw new NotFoundException('الغرفة غير موجودة');
    if (room.players.length < 2) throw new BadRequestException('نحتاج لاعبين على الأقل');
    if (room.started) return room;

    room.gameState.dominoDeck = this.dominoService.shuffle(this.dominoService.createDeck());
    room.gameState.board = [];
    room.gameState.hands = {};

    for (const playerId of room.players) {
      room.gameState.hands[String(playerId)] = room.gameState.dominoDeck.splice(0, 7);
    }

    room.started = true;
    room.status = 'playing';
    room.gameState.started = true;
    room.gameState.currentPlayer = room.players[0];
    return room;
  }

  playDomino(code: string, playerId: number, tileIndex: number, side: BoardSide = 'right') {
    const room = this.findByCode(code);
    if (!room || !room.started) throw new BadRequestException('اللعبة لم تبدأ بعد');
    if (room.gameState.currentPlayer !== playerId) throw new BadRequestException('ليس دورك الآن');
    if (side !== 'left' && side !== 'right') throw new BadRequestException('جهة اللعب غير صحيحة');

    const hand = room.gameState.hands[String(playerId)] || [];
    if (!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= hand.length) {
      throw new BadRequestException('قطعة الدومينو غير صحيحة');
    }

    const original = hand[tileIndex];
    let tile: Domino = { ...original };
    const board = room.gameState.board;

    if (board.length > 0) {
      if (side === 'right') {
        const edge = board[board.length - 1].right;
        if (tile.left !== edge) {
          if (tile.right === edge) tile = { left: tile.right, right: tile.left };
          else throw new BadRequestException(`لا يمكن وضع ${original.left}-${original.right} على اليمين`);
        }
      } else {
        const edge = board[0].left;
        if (tile.right !== edge) {
          if (tile.left === edge) tile = { left: tile.right, right: tile.left };
          else throw new BadRequestException(`لا يمكن وضع ${original.left}-${original.right} على اليسار`);
        }
      }
    }

    hand.splice(tileIndex, 1);
    if (side === 'left') board.unshift(tile);
    else board.push(tile);

    const winner = hand.length === 0 ? playerId : null;
    if (winner !== null) {
      room.status = 'finished';
      room.started = false;
      room.gameState.started = false;
    } else {
      const currentIndex = room.players.indexOf(playerId);
      room.gameState.currentPlayer = room.players[(currentIndex + 1) % room.players.length];
    }

    return { room, tile, winner };
  }
}
