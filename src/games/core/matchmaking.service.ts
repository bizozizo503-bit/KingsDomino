import { Injectable, Logger } from '@nestjs/common';

export interface MatchRequest {
  playerId: string;
  playerName: string;
  gameId: string;
  minRating?: number;
  maxRating?: number;
  joinedAt: number;
}

export interface MatchResult {
  playerId: string;
  playerName: string;
  rating: number;
}

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);
  private queues = new Map<string, MatchRequest[]>();
  private matchmakingTimer: ReturnType<typeof setInterval> | null = null;

  private readonly MATCH_INTERVAL_MS = 3000;
  private readonly MAX_WAIT_MS = 30000;
  private readonly RATING_TOLERANCE_STEP = 50;

  constructor() {
    this.matchmakingTimer = setInterval(
      () => this.processQueues(),
      this.MATCH_INTERVAL_MS,
    );
  }

  onDestroy() {
    if (this.matchmakingTimer) {
      clearInterval(this.matchmakingTimer);
    }
  }

  joinQueue(request: MatchRequest): { position: number; estimatedWaitMs: number } {
    const queue = this.getQueue(request.gameId);

    const existing = queue.find(r => r.playerId === request.playerId);
    if (existing) {
      queue.splice(queue.indexOf(existing), 1);
    }

    queue.push({ ...request, joinedAt: Date.now() });

    const position = queue.findIndex(r => r.playerId === request.playerId) + 1;

    return {
      position,
      estimatedWaitMs: Math.min(position * this.MATCH_INTERVAL_MS, this.MAX_WAIT_MS),
    };
  }

  leaveQueue(playerId: string, gameId: string): boolean {
    const queue = this.queues.get(gameId);
    if (!queue) return false;

    const index = queue.findIndex(r => r.playerId === playerId);
    if (index === -1) return false;

    queue.splice(index, 1);
    return true;
  }

  leaveAllQueues(playerId: string): void {
    for (const [gameId, queue] of this.queues) {
      const index = queue.findIndex(r => r.playerId === playerId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
  }

  getQueuePosition(playerId: string, gameId: string): number {
    const queue = this.getQueue(gameId);
    return queue.findIndex(r => r.playerId === playerId) + 1;
  }

  getQueueSize(gameId: string): number {
    return this.getQueue(gameId).length;
  }

  private getQueue(gameId: string): MatchRequest[] {
    if (!this.queues.has(gameId)) {
      this.queues.set(gameId, []);
    }
    return this.queues.get(gameId)!;
  }

  private processQueues(): void {
    for (const [gameId, queue] of this.queues) {
      if (queue.length < 2) continue;

      this.tryMatch(gameId, queue);
    }
  }

  private tryMatch(gameId: string, queue: MatchRequest[]): void {
    const now = Date.now();

    const sorted = [...queue].sort((a, b) => a.joinedAt - b.joinedAt);

    for (let i = 0; i < sorted.length; i++) {
      const requester = sorted[i];
      const waitTime = now - requester.joinedAt;
      const tolerance = this.RATING_TOLERANCE_STEP * Math.floor(waitTime / 5000);

      for (let j = i + 1; j < sorted.length; j++) {
        const candidate = sorted[j];

        if (this.canMatch(requester, candidate, tolerance)) {
          this.executeMatch(gameId, [requester, candidate]);
          return;
        }
      }
    }
  }

  private canMatch(a: MatchRequest, b: MatchRequest, tolerance: number): boolean {
    const ratingA = a.minRating || 1000;
    const ratingB = b.minRating || 1000;

    const diff = Math.abs(ratingA - ratingB);
    return diff <= tolerance + 100;
  }

  private executeMatch(gameId: string, players: MatchRequest[]): void {
    const queue = this.getQueue(gameId);

    for (const player of players) {
      const index = queue.findIndex(r => r.playerId === player.playerId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }

    this.logger.log(`Matched ${players.length} players for ${gameId}`);

    const matchResult: MatchResult[] = players.map(p => ({
      playerId: p.playerId,
      playerName: p.playerName,
      rating: p.minRating || 1000,
    }));

    this.logger.log(`Match ready: ${JSON.stringify(matchResult)}`);
  }
}
