import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomsService: RoomsService) {}

  @SubscribeMessage('joinRoom')
  handleJoin(
    @MessageBody()
    data: {
      roomCode: string;
      playerId: number;
      name?: string;
    },
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
      client.emit('gameError', {
        message: this.errorMessage(error),
      });
    }
  }

  @SubscribeMessage('startGame')
  handleStart(@MessageBody() data: { roomCode: string }) {
    try {
      const room = this.roomsService.startGame(data.roomCode);

      for (const playerId of room.players) {
        const hand = room.gameState.hands[String(playerId)] || [];

        this.server.to(data.roomCode).emit('gameStarted', {
          roomCode: room.code,
          playerId,
          hand,
          currentPlayer: room.gameState.currentPlayer,
          board: room.gameState.board,
          players: room.players,
          playerNames: room.playerNames,
        });
      }

      this.server
        .to(data.roomCode)
        .emit('roomUpdated', this.publicRoom(room));
    } catch (error) {
      this.server.to(data.roomCode).emit('gameError', {
        message: this.errorMessage(error),
      });
    }
  }

  @SubscribeMessage('playDomino')
  handlePlay(
    @MessageBody()
    data: {
      roomCode: string;
      playerId: number;
      tileIndex: number;
    },
  ) {
    try {
      const result = this.roomsService.playDomino(
        data.roomCode,
        Number(data.playerId),
        Number(data.tileIndex),
      );

      this.server.to(data.roomCode).emit('dominoPlayed', {
        playerId: data.playerId,
        tile: result.tile,
        board: result.room.gameState.board,
        currentPlayer: result.room.gameState.currentPlayer,
        winner: result.winner,
        handsCount: Object.fromEntries(
          Object.entries(result.room.gameState.hands).map(
            ([id, hand]) => [id, hand.length],
          ),
        ),
      });
    } catch (error) {
      this.server.to(data.roomCode).emit('gameError', {
        message: this.errorMessage(error),
      });
    }
  }

  @SubscribeMessage('chat')
  handleChat(
    @MessageBody()
    data: {
      roomCode: string;
      name: string;
      message: string;
    },
  ) {
    this.server.to(data.roomCode).emit('chat', {
      name: data.name,
      message: data.message,
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

    return map[error?.message] || 'حدث خطأ غير متوقع';
  }
}
