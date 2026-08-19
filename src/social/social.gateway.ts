import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { FriendsService } from './friends.service';
import { NotificationService } from './notification.service';
import { ProfileService } from './profile.service';
import { ChatRoomType } from './entities/chat-message.entity';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/social',
})
export class SocialGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocialGateway.name);
  private clientUsers = new Map<string, { userId: string; username: string }>();
  private userClients = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly friendsService: FriendsService,
    private readonly notificationService: NotificationService,
    private readonly profileService: ProfileService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      client.emit('error', { message: 'Authentication required' });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.clientUsers.set(client.id, { userId, username: payload.username });

      if (!this.userClients.has(userId)) {
        this.userClients.set(userId, new Set());
      }
      this.userClients.get(userId)!.add(client.id);

      await this.profileService.setOnline(userId, true);
      this.logger.log(`Social client connected: ${client.id} (${payload.username})`);
    } catch {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = this.clientUsers.get(client.id);
    if (user) {
      const clients = this.userClients.get(user.userId);
      clients?.delete(client.id);

      if (clients?.size === 0) {
        this.userClients.delete(user.userId);
        await this.profileService.setOnline(user.userId, false);
      }
    }

    this.clientUsers.delete(client.id);
  }

  @SubscribeMessage('chat:send')
  async handleChatSend(
    @MessageBody(new ValidationPipe({ transform: true, whitelist: true }))
    data: { roomId: string; roomType?: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.clientUsers.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const roomType = (data.roomType as ChatRoomType) || ChatRoomType.GLOBAL;

      const message = await this.chatService.sendMessage(
        data.roomId,
        roomType,
        user.userId,
        user.username,
        data.content,
      );

      this.server.to(data.roomId).emit('chat:message', {
        id: message.id,
        roomId: message.room_id,
        senderId: message.sender_id,
        senderName: message.sender_name,
        content: message.content,
        createdAt: message.created_at,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('chat:join')
  handleChatJoin(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    client.emit('chat:joined', { roomId: data.roomId });
  }

  @SubscribeMessage('chat:leave')
  handleChatLeave(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    client.emit('chat:left', { roomId: data.roomId });
  }

  @SubscribeMessage('friend:online_status')
  async handleGetOnlineStatus(
    @MessageBody() data: { userIds: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const statuses: Record<string, boolean> = {};
    for (const userId of data.userIds) {
      statuses[userId] = this.userClients.has(userId);
    }
    client.emit('friend:online_statuses', statuses);
  }

  notifyUser(userId: string, event: string, data: any): void {
    const clientIds = this.userClients.get(userId);
    if (clientIds) {
      for (const clientId of clientIds) {
        this.server.to(clientId).emit(event, data);
      }
    }
  }

  broadcastToRoom(roomId: string, event: string, data: any): void {
    this.server.to(roomId).emit(event, data);
  }
}
