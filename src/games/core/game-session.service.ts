import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession, SessionStatus } from './entities/game-session.entity';
import { GameRegistry } from './game-registry.service';
import { IGame, GameStartOptions, GameStateUpdate } from './game.interface';

export interface ActiveSession {
  session: GameSession;
  gameInstance: IGame;
}

@Injectable()
export class GameSessionService {
  private readonly logger = new Logger(GameSessionService.name);
  private activeSessions = new Map<string, ActiveSession>();

  constructor(
    @InjectRepository(GameSession)
    private sessionRepo: Repository<GameSession>,
    private gameRegistry: GameRegistry,
  ) {}

  async createSession(
    gameId: string,
    roomCode: string,
    playerIds: string[],
    playerNames: Record<string, string>,
    config?: Record<string, any>,
  ): Promise<GameSession> {
    const session = this.sessionRepo.create({
      game_id: gameId,
      room_code: roomCode,
      status: SessionStatus.WAITING,
      player_ids: playerIds,
      player_names: playerNames,
      state: {},
      round_number: 1,
    });

    const saved = await this.sessionRepo.save(session);
    this.logger.log(`Created session ${saved.id} for game ${gameId}`);
    return saved;
  }

  async startSession(sessionId: string): Promise<ActiveSession> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new Error('SESSION_NOT_FOUND');

    const gameInstance = this.gameRegistry.createGameInstance(session.game_id);

    const options: GameStartOptions = {
      playerIds: session.player_ids,
      playerNames: session.player_names,
      config: session.state || {},
    };

    const initialState = gameInstance.initGame(options);

    session.status = SessionStatus.PLAYING;
    session.started_at = Date.now();
    session.state = initialState;
    await this.sessionRepo.save(session);

    const active: ActiveSession = { session, gameInstance };
    this.activeSessions.set(session.id, active);

    this.logger.log(`Started session ${session.id} (${session.game_id})`);
    return active;
  }

  async processMove(
    sessionId: string,
    playerId: string,
    action: string,
    data: Record<string, any>,
  ): Promise<{ update: GameStateUpdate; gameOver: boolean; result?: any }> {
    const active = this.activeSessions.get(sessionId);
    if (!active) throw new Error('SESSION_NOT_ACTIVE');

    const update = active.gameInstance.handleMove(playerId, action, data);
    active.session.turn_count += 1;

    const gameOver = active.gameInstance.isGameOver();

    if (gameOver) {
      const result = active.gameInstance.getResult();
      active.session.status = SessionStatus.FINISHED;
      active.session.result = result;
      active.session.winner_id = result.winner ?? '';
      active.session.finished_at = Date.now();
      active.session.finish_reason = result.reason;

      await this.sessionRepo.save(active.session);
      this.activeSessions.delete(sessionId);

      return { update, gameOver: true, result };
    }

    active.session.state = active.gameInstance.getStateForPlayer(null as any);
    await this.sessionRepo.save(active.session);

    return { update, gameOver: false };
  }

  getActiveSession(sessionId: string): ActiveSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getActiveSessionByRoom(roomCode: string): ActiveSession | undefined {
    for (const active of this.activeSessions.values()) {
      if (active.session.room_code === roomCode) {
        return active;
      }
    }
    return undefined;
  }

  getStateForPlayer(sessionId: string, playerId: string): Record<string, any> | null {
    const active = this.activeSessions.get(sessionId);
    if (!active) return null;
    return active.gameInstance.getStateForPlayer(playerId);
  }

  async getPlayerStats(playerId: string, gameId?: string): Promise<{
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    totalXp: number;
    averageScore: number;
  }> {
    const query = this.sessionRepo.createQueryBuilder('session')
      .where('session.player_ids LIKE :playerId', { playerId: `%${playerId}%` })
      .andWhere('session.status = :status', { status: SessionStatus.FINISHED });

    if (gameId) {
      query.andWhere('session.game_id = :gameId', { gameId });
    }

    const sessions = await query.getMany();

    const gamesPlayed = sessions.length;
    const gamesWon = sessions.filter(s => s.winner_id === playerId).length;
    const totalXp = sessions.reduce((sum, s) => {
      const rewards = s.result?.rewards?.[playerId];
      return sum + (rewards?.xp || 0);
    }, 0);

    return {
      gamesPlayed,
      gamesWon,
      winRate: gamesPlayed > 0 ? gamesWon / gamesPlayed : 0,
      totalXp,
      averageScore: gamesPlayed > 0 ? totalXp / gamesPlayed : 0,
    };
  }

  async getRecentSessions(playerId: string, limit = 10): Promise<GameSession[]> {
    return this.sessionRepo
      .createQueryBuilder('session')
      .where('session.player_ids LIKE :playerId', { playerId: `%${playerId}%` })
      .andWhere('session.status = :status', { status: SessionStatus.FINISHED })
      .orderBy('session.finished_at', 'DESC')
      .take(limit)
      .getMany();
  }
}
