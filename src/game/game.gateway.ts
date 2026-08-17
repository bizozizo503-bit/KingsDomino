import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomsService } from '../rooms/rooms.service';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clientRooms = new Map<string, Set<string>>();
  private readonly MAX_CHAT_LENGTH = 200;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      client.emit('gameError', { message: 'غير مصرح — يلزم تسجيل الدخول' });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      (client as any).userId = payload.sub;
      (client as any).username = payload.username;
    } catch {
      client.emit('gameError', { message: 'توكن غير صالح' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId as string;
    const rooms = this.clientRooms.get(client.id);

    if (userId && rooms) {
      for (const roomCode of rooms) {
        this.roomsService.handleDisconnect(roomCode, userId);
      }
    }

    this.clientRooms.delete(client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoin(
    @MessageBody()
    data: { roomCode: string; name?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).userId as string;
    const username = (client as any).username as string;

    if (!userId) {
      client.emit('gameError', { message: 'غير مصرح' });
      return;
    }

    try {
      const room = this.roomsService.joinRoom(
        data.roomCode,
        userId,
        data.name || username,
      );

      client.join(room.code);
      client.join(userId);

      if (!this.clientRooms.has(client.id)) {
        this.clientRooms.set(client.id, new Set());
      }
      this.clientRooms.get(client.id)!.add(room.code);

      this.server.to(room.code).emit('roomUpdated', this.publicRoom(room));
    } catch (error) {
      client.emit('gameError', {
        message: this.errorMessage(error),
      });
    }
  }

  @SubscribeMessage('startGame')
  handleStart(
    @MessageBody() data: { roomCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).userId as string;

    if (!userId) {
      client.emit('gameError', { message: 'غير مصرح' });
      return;
    }

    try {
      const room = this.roomsService.getRoom(data.roomCode);
      if (!room) {
        client.emit('gameError', { message: this.errorMessage({ message: 'ROOM_NOT_FOUND' }) });
        return;
      }

      if (room.host !== userId) {
        client.emit('gameError', { message: this.errorMessage({ message: 'NOT_HOST' }) });
        return;
      }

      const startedRoom = this.roomsService.startGame(data.roomCode, userId);

      for (const playerId of startedRoom.players) {
        const hand = startedRoom.gameState.hands[playerId] || [];

        this.server.to(playerId).emit('gameStarted', {
          roomCode: startedRoom.code,
          hand,
          currentPlayer: startedRoom.gameState.currentPlayer,
          board: startedRoom.gameState.board,
          players: startedRoom.players,
          playerNames: startedRoom.playerNames,
        });
      }

      this.server.to(startedRoom.code).emit('roomUpdated', this.publicRoom(startedRoom));
    } catch (error) {
      this.server.to(data.roomCode).emit('gameError', {
        message: this.errorMessage(error),
      });
    }
  }

  @SubscribeMessage('playDomino')
  handlePlay(
    @MessageBody()
    data: { roomCode: string; tileIndex: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).userId as string;

    if (!userId) {
      client.emit('gameError', { message: 'غير مصرح' });
      return;
    }

    try {
      const result = this.roomsService.playDomino(
        data.roomCode,
        userId,
        Number(data.tileIndex),
      );

      for (const playerId of result.room.players) {
        const hand = result.room.gameState.hands[playerId] || [];
        this.server.to(playerId).emit('dominoPlayed', {
          tile: playerId === userId ? result.tile : null,
          board: result.room.gameState.board,
          currentPlayer: result.room.gameState.currentPlayer,
          winner: result.winner,
          myHandCount: hand.length,
          handsCount: Object.fromEntries(
            Object.entries(result.room.gameState.hands).map(
              ([id, h]) => [id, h.length],
            ),
          ),
        });
      }
    } catch (error) {
      client.emit('gameError', {
        message: this.errorMessage(error),
      });
    }
  }

  @SubscribeMessage('chat')
  handleChat(
    @MessageBody()
    data: { roomCode: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = (client as any).userId as string;
    const username = (client as any).username as string;

    if (!userId) return;

    const rooms = this.clientRooms.get(client.id);
    if (!rooms || !rooms.has(data.roomCode)) {
      client.emit('gameError', { message: this.errorMessage({ message: 'NOT_IN_ROOM' }) });
      return;
    }

    const trimmed = (data.message || '').trim();
    if (trimmed.length === 0 || trimmed.length > this.MAX_CHAT_LENGTH) {
      return;
    }

    this.server.to(data.roomCode).emit('chat', {
      name: username,
      message: trimmed,
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
      NOT_HOST: 'فقط صاحب الغرفة يمكنه بدء اللعبة',
      INVALID_TILE: 'قطعة الدومينو غير صحيحة',
      INVALID_PLACEMENT: 'القطعة لا تتطابق مع طرفي اللوحة',
      INVALID_PLAYER: 'اللاعب غير صحيح',
      NOT_IN_ROOM: 'أنت لست عضواً في هذه الغرفة',
      DISCONNECTED_PLAYER: 'تم قطع اتصال اللاعب، يرجى الانتظار',
    };

    return map[error?.message] || 'حدث خطأ غير متوقع';
  }
}
