import { Injectable } from '@nestjs/common';
import { DominoService } from '../game/domino.service';

export interface GameState {
  players: number[];
  dominoDeck: any[];
  started: boolean;
  currentPlayer: number;
  board: any[];
  hands: Record<string, any[]>;
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

  create(data: {
    name: string;
    players: number;
    host: string;
    status: string;
  }): Room {
    const code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

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

  findAll() {
    return this.rooms;
  }

  findByCode(code: string) {
    return this.rooms.find(
      (room) => room.code.toUpperCase() === code.toUpperCase(),
    );
  }

  joinRoom(code: string, playerId: number, name: string) {
    const room = this.findByCode(code);

    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }

    if (room.started) {
      throw new Error('GAME_ALREADY_STARTED');
    }

    if (!Number.isFinite(playerId)) {
      throw new Error('INVALID_PLAYER');
    }

    if (!room.players.includes(playerId)) {
      if (room.players.length >= room.maxPlayers) {
        throw new Error('ROOM_FULL');
      }

      room.players.push(playerId);
      room.gameState.players.push(playerId);
    }

    room.playerNames[String(playerId)] = name;

    return room;
  }

  startGame(code: string) {
    const room = this.findByCode(code);

    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
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
      room.gameState.hands[String(playerId)] =
        room.gameState.dominoDeck.splice(0, 7);
    }

    room.started = true;
    room.status = 'playing';
    room.gameState.started = true;
    room.gameState.currentPlayer = room.players[0];

    return room;
  }

  playDomino(code: string, playerId: number, tileIndex: number) {
    const room = this.findByCode(code);

    if (!room || !room.started) {
      throw new Error('GAME_NOT_STARTED');
    }

    if (room.gameState.currentPlayer !== playerId) {
      throw new Error('NOT_YOUR_TURN');
    }

    const hand = room.gameState.hands[String(playerId)] || [];
    const tile = hand[tileIndex];

    if (!tile) {
      throw new Error('INVALID_TILE');
    }

    hand.splice(tileIndex, 1);
    room.gameState.board.push(tile);

    const currentIndex = room.players.indexOf(playerId);
    const nextIndex = (currentIndex + 1) % room.players.length;
    room.gameState.currentPlayer = room.players[nextIndex];

    if (hand.length === 0) {
      room.status = 'finished';
      room.started = false;
      room.gameState.started = false;
    }

    return {
      room,
      tile,
      winner: hand.length === 0 ? playerId : null,
    };
  }
}
