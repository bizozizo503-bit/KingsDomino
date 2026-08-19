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
import { GameRegistry } from './core/game-registry.service';
import { GameSessionService } from './core/game-session.service';
import { MatchmakingService } from './core/matchmaking.service';
import { LeaderboardService } from './core/leaderboard.service';
import {
  JoinMatchmakingDto,
  LeaveMatchmakingDto,
  CreateGameSessionDto,
  GameMoveDto,
  ResignDto,
} from './dto/games.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/games',
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GamesGateway.name);
  private clientUsers = new Map<string, { userId: string; username: string }>();
  private clientSessions = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameRegistry: GameRegistry,
    private readonly sessionService: GameSessionService,
    private readonly matchmakingService: MatchmakingService,
    private readonly leaderboardService: LeaderboardService,
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
      this.clientUsers.set(client.id, {
        userId: payload.sub,
        username: payload.username,
      });
      this.logger.log(`Client connected: ${client.id} (${payload.username})`);
    } catch {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.clientUsers.get(client.id);
    if (user) {
      this.matchmakingService.leaveAllQueues(user.userId);
      this.logger.log(`Client disconnected: ${client.id} (${user.username})`);
    }

    this.clientUsers.delete(client.id);
    this.clientSessions.delete(client.id);
  }

  @SubscribeMessage('getGames')
  handleGetGames(@ConnectedSocket() client: Socket) {
    const games = this.gameRegistry.getAllGames().map(g => ({
      id: g.gameId,
      name: g.metadata.name,
      nameAr: g.metadata.nameAr,
      category: g.metadata.category,
      minPlayers: g.metadata.minPlayers,
      maxPlayers: g.metadata.maxPlayers,
      isRanked: g.metadata.isRanked,
      icon: g.metadata.icon,
    }));

    client.emit('gamesList', { games });
  }

  @SubscribeMessage('joinMatchmaking')
  handleJoinMatchmaking(
    @MessageBody(new ValidationPipe({ transform: true, whitelist: true }))
    data: JoinMatchmakingDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.clientUsers.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const game = this.gameRegistry.getGame(data.gameId);
    if (!game) {
      client.emit('error', { message: 'Game not found' });
      return;
    }

    const result = this.matchmakingService.joinQueue({
      playerId: user.userId,
      playerName: user.username,
      gameId: data.gameId,
      joinedAt: Date.now(),
    });

    client.emit('matchmakingJoined', {
      gameId: data.gameId,
      position: result.position,
      estimatedWaitMs: result.estimatedWaitMs,
    });
  }

  @SubscribeMessage('leaveMatchmaking')
  handleLeaveMatchmaking(
    @MessageBody(new ValidationPipe({ transform: true, whitelist: true }))
    data: LeaveMatchmakingDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.clientUsers.get(client.id);
    if (!user) return;

    this.matchmakingService.leaveQueue(user.userId, data.gameId);
    client.emit('matchmakingLeft', { gameId: data.gameId });
  }

  @SubscribeMessage('createSession')
  async handleCreateSession(
    @MessageBody(new ValidationPipe({ transform: true, whitelist: true }))
    data: CreateGameSessionDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.clientUsers.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const session = await this.sessionService.createSession(
        data.gameId,
        data.roomCode || this.generateCode(),
        data.playerIds,
        data.playerNames || {},
        data.config,
      );

      this.clientSessions.set(client.id, session.id);

      client.emit('sessionCreated', {
        sessionId: session.id,
        gameId: session.game_id,
        roomCode: session.room_code,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('startSession')
  async handleStartSession(
    @MessageBody(new ValidationPipe({ transform: true }))
    data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const active = await this.sessionService.startSession(data.sessionId);

      const playerIds = active.session.player_ids;
      for (const playerId of playerIds) {
        const stateForPlayer = active.gameInstance.getStateForPlayer(playerId);
        this.server.to(playerId).emit('gameStarted', {
          sessionId: active.session.id,
          gameId: active.session.game_id,
          state: stateForPlayer,
        });
      }

      client.emit('sessionStarted', { sessionId: active.session.id });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('gameMove')
  async handleGameMove(
    @MessageBody(new ValidationPipe({ transform: true, whitelist: true }))
    data: GameMoveDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.clientUsers.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      const result = await this.sessionService.processMove(
        data.sessionId,
        user.userId,
        data.action,
        data.data || {},
      );

      const session = this.sessionService.getActiveSession(data.sessionId);
      if (session) {
        for (const playerId of session.session.player_ids) {
          const stateForPlayer = session.gameInstance.getStateForPlayer(playerId);
          this.server.to(playerId).emit('gameUpdate', {
            sessionId: data.sessionId,
            update: result.update,
            state: stateForPlayer,
          });
        }
      }

      if (result.gameOver && result.result) {
        const activeSession = await this.sessionService.getActiveSession(data.sessionId);

        for (const [playerId, rewards] of Object.entries(result.result.rewards as any)) {
          this.server.to(playerId).emit('gameOver', {
            sessionId: data.sessionId,
            winner: result.result.winner,
            scores: result.result.scores,
            rewards,
            reason: result.result.reason,
          });
        }
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('resign')
  async handleResign(
    @MessageBody(new ValidationPipe({ transform: true, whitelist: true }))
    data: ResignDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.clientUsers.get(client.id);
    if (!user) return;

    try {
      await this.sessionService.processMove(
        data.sessionId,
        user.userId,
        'resign',
        {},
      );
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('getLeaderboard')
  async handleGetLeaderboard(
    @MessageBody() data: { gameId: string; period?: string; limit?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const leaderboard = await this.leaderboardService.getLeaderboard(
      data.gameId,
      (data.period as any) || 'all_time',
      data.limit || 50,
    );

    client.emit('leaderboard', { gameId: data.gameId, entries: leaderboard });
  }

  @SubscribeMessage('getMyStats')
  async handleGetMyStats(
    @MessageBody() data: { gameId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.clientUsers.get(client.id);
    if (!user) return;

    const stats = await this.sessionService.getPlayerStats(user.userId, data.gameId);
    client.emit('myStats', stats);
  }

  private generateCode(): string {
    return Math.random().toString(16).substring(2, 8).toUpperCase();
  }
}
