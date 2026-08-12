import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService, BoardSide } from '../rooms/rooms.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomsService: RoomsService) {}

  @SubscribeMessage('joinRoom')
  handleJoin(
    @MessageBody() data: { roomCode: string; playerId: number; name?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const room = this.roomsService.joinRoom(
        data.roomCode,
        Number(data.playerId),
        data.name || `Player${data.playerId}`,
      );
      client.join(room.code);
      this.server.to(room.code).emit('roomUpdated', this.publicRoom(room));
    } catch (error) {
      client.emit('gameError', { message: this.errorMessage(error) });
    }
  }

  @SubscribeMessage('startGame')
  handleStart(@MessageBody() data: { roomCode: string }) {
    try {
      const room = this.roomsService.startGame(data.roomCode);
      for (const playerId of room.players) {
        this.server.to(data.roomCode).emit('gameStarted', {
          roomCode: room.code,
          playerId,
          hand: room.gameState.hands[String(playerId)] || [],
          currentPlayer: room.gameState.currentPlayer,
          board: room.gameState.board,
          players: room.players,
          playerNames: room.playerNames,
        });
      }
      this.server.to(data.roomCode).emit('roomUpdated', this.publicRoom(room));
    } catch (error) {
      this.server.to(data.roomCode).emit('gameError', { message: this.errorMessage(error) });
    }
  }

  @SubscribeMessage('playDomino')
  handlePlay(
    @MessageBody() data: {
      roomCode: string;
      playerId: number;
      tileIndex: number;
      side?: BoardSide;
    },
  ) {
    try {
      const result = this.roomsService.playDomino(
        data.roomCode,
        Number(data.playerId),
        Number(data.tileIndex),
        data.side || 'right',
      );

      this.server.to(data.roomCode).emit('dominoPlayed', {
        playerId: data.playerId,
        tile: result.tile,
        board: result.room.gameState.board,
        currentPlayer: result.room.gameState.currentPlayer,
        winner: result.winner,
        handsCount: Object.fromEntries(
          Object.entries(result.room.gameState.hands).map(([id, hand]) => [id, hand.length]),
        ),
      });
    } catch (error) {
      this.server.to(data.roomCode).emit('gameError', { message: this.errorMessage(error) });
    }
  }

  @SubscribeMessage('chat')
  handleChat(@MessageBody() data: { roomCode: string; name: string; message: string }) {
    this.server.to(data.roomCode).emit('chat', {
      name: data.name,
      message: String(data.message || '').slice(0, 500),
    });
  }

  private publicRoom(room: any) {
    return {
      code: room.code,
      name: room.name,
      maxPlayers: room.maxPlayers,
      host: room.host,
      status: room.status,
      players: room.players,
      playerNames: room.playerNames,
      started: room.started,
      currentPlayer: room.gameState.currentPlayer,
      board: room.gameState.board,
    };
  }

  private errorMessage(error: any) {
    const message = error?.message;
    const map: Record<string, string> = {
      ROOM_NOT_FOUND: 'الغرفة غير موجودة',
      GAME_ALREADY_STARTED: 'اللعبة بدأت بالفعل',
      ROOM_FULL: 'الغرفة ممتلئة',
      NEED_TWO_PLAYERS: 'نحتاج لاعبين على الأقل',
      GAME_NOT_STARTED: 'اللعبة لم تبدأ بعد',
      NOT_YOUR_TURN: 'ليس دورك الآن',
      INVALID_TILE: 'قطعة الدومينو غير صحيحة',
      INVALID_PLAYER: 'اللاعب غير صحيح',
    };
    return map[message] || message || 'حدث خطأ غير متوقع';
  }
}
