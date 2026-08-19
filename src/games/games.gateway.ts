import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ValidationPipe, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { GameRegistry } from './core/game-registry.service';
import { GameSessionService } from './core/game-session.service';
import { MatchmakingService } from './core/matchmaking.service';
import { LeaderboardService } from './core/leaderboard.service';
import { AchievementService } from '../rewards/achievement.service';
import { ProfileService } from '../social/profile.service';
import { UsersService } from '../users/users.service';
import { WsRateLimitGuard } from '../common/guards/ws-rate-limit.guard';
import {
  JoinMatchmakingDto,
  LeaveMatchmakingDto,
  CreateGameSessionDto,
  GameMoveDto,
  ResignDto,
} from './dto/games.dto';

@UseGuards(WsRateLimitGuard)
@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGINS?.split(',').map(value => value.trim()).filter(Boolean) || true },
  namespace: '/games',
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GamesGateway.name);
  private clientUsers = new Map<string, { userId: string; username: string }>();
  private clientSessions = new Map<string, string>();
  private userSockets = new Map<string, Set<string>>();

  afterInit(): void {
    this.matchmakingService.setMatchHandler(async (gameId, players) => {
      const session = await this.sessionService.createSession(
        gameId,
        this.generateCode(),
        players.map(player => player.playerId),
        Object.fromEntries(players.map(player => [player.playerId, player.playerName])),
      );
      for (const player of players) {
        for (const socketId of this.userSockets.get(player.playerId) || []) {
          this.server.to(socketId).emit('matchFound', {
            sessionId: session.id,
            gameId: session.game_id,
            roomCode: session.room_code,
            players,
          });
        }
      }
    });
  }

  constructor(
    private readonly jwtService: JwtService,
    private readonly gameRegistry: GameRegistry,
    private readonly sessionService: GameSessionService,
    private readonly matchmakingService: MatchmakingService,
    private readonly leaderboardService: LeaderboardService,
    private readonly achievementService: AchievementService,
    private readonly profileService: ProfileService,
    private readonly usersService: UsersService,
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
      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.is_active) throw new Error('INACTIVE_USER');
      this.clientUsers.set(client.id, {
        userId: payload.sub,
        username: payload.username,
      });
      if (!this.userSockets.has(user.id)) this.userSockets.set(user.id, new Set());
      this.userSockets.get(user.id)!.add(client.id);
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
    if (user) {
      const sockets = this.userSockets.get(user.userId);
      sockets?.delete(client.id);
      if (sockets?.size === 0) this.userSockets.delete(user.userId);
    }
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
      if (!data.playerIds.includes(user.userId)) {
        throw new Error('SESSION_CREATOR_MUST_BE_PLAYER');
      }
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
    const user = this.clientUsers.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }
    try {
      const active = await this.sessionService.startSession(data.sessionId, user.userId);

      const playerIds = active.session.player_ids;
      for (const playerId of playerIds) {
        const stateForPlayer = active.gameInstance.getStateForPlayer(playerId);
        for (const socketId of this.userSockets.get(playerId) || []) {
          this.server.to(socketId).emit('gameStarted', {
            sessionId: active.session.id,
            gameId: active.session.game_id,
            state: stateForPlayer,
          });
        }
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
        const activeSession = result.activeSession;
        if (!activeSession) return;

        for (const playerId of activeSession.session.player_ids) {
          const won = result.result.winner === playerId;

          await this.leaderboardService.recordGameResult(
            activeSession.session.game_id,
            playerId,
            won,
            won ? 100 : 10,
          );

          await this.profileService.recordGameResult(
            playerId,
            won,
            won ? 100 : 10,
          );

          const profile = await this.profileService.getOrCreateProfile(playerId, '');
          await this.achievementService.checkAndUpdateProgress(
            playerId,
            'games_played',
            profile.games_played,
          );
          await this.achievementService.checkAndUpdateProgress(
            playerId,
            'games_won',
            profile.games_won,
          );
          await this.achievementService.checkAndUpdateProgress(
            playerId,
            'win_streak',
            profile.current_win_streak,
          );
          await this.achievementService.checkAndUpdateProgress(
            playerId,
            'level',
            profile.level,
          );

          const rewards = (result.result.rewards as any)?.[playerId] || {};
          this.server.to(playerId).emit('gameOver', {
            sessionId: data.sessionId,
            winner: result.result.winner,
            scores: result.result.scores,
            rewards,
            reason: result.result.reason,
          });
        }

        this.sessionService.removeActiveSession(data.sessionId);
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
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }
}
