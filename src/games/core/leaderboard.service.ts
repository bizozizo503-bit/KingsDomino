import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardEntry, LeaderboardPeriod } from './entities/leaderboard.entity';

export interface LeaderboardRow {
  rank: number;
  playerId: string;
  score: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  winStreak: number;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    @InjectRepository(LeaderboardEntry)
    private leaderboardRepo: Repository<LeaderboardEntry>,
  ) {}

  async recordGameResult(
    gameId: string,
    playerId: string,
    won: boolean,
    scoreGain: number,
    period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
  ): Promise<void> {
    let entry = await this.leaderboardRepo.findOne({
      where: { game_id: gameId, player_id: playerId, period },
    });

    if (!entry) {
      entry = this.leaderboardRepo.create({
        game_id: gameId,
        player_id: playerId,
        period,
        score: '0',
        games_played: 0,
        games_won: 0,
        win_streak: 0,
        best_win_streak: 0,
        rank: 0,
      });
    }

    const currentScore = BigInt(entry.score);
    entry.score = (currentScore + BigInt(scoreGain)).toString();
    entry.games_played += 1;

    if (won) {
      entry.games_won += 1;
      entry.win_streak += 1;
      entry.best_win_streak = Math.max(entry.best_win_streak, entry.win_streak);
    } else {
      entry.win_streak = 0;
    }

    entry.updated_at = Date.now();
    await this.leaderboardRepo.save(entry);

    await this.recalculateRanks(gameId, period);
  }

  async getLeaderboard(
    gameId: string,
    period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
    limit = 50,
    offset = 0,
  ): Promise<LeaderboardRow[]> {
    const entries = await this.leaderboardRepo.find({
      where: { game_id: gameId, period },
      order: { score: 'DESC' },
      take: limit,
      skip: offset,
    });

    return entries.map((entry, i) => ({
      rank: offset + i + 1,
      playerId: entry.player_id,
      score: Number(entry.score),
      gamesPlayed: entry.games_played,
      gamesWon: entry.games_won,
      winRate: entry.games_played > 0 ? entry.games_won / entry.games_played : 0,
      winStreak: entry.win_streak,
    }));
  }

  async getPlayerRank(
    gameId: string,
    playerId: string,
    period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
  ): Promise<LeaderboardRow | null> {
    const entry = await this.leaderboardRepo.findOne({
      where: { game_id: gameId, player_id: playerId, period },
    });

    if (!entry) return null;

    const rank = await this.leaderboardRepo
      .createQueryBuilder('lb')
      .where('lb.game_id = :gameId', { gameId })
      .andWhere('lb.period = :period', { period })
      .andWhere('lb.score > :score', { score: entry.score })
      .getCount();

    return {
      rank: rank + 1,
      playerId: entry.player_id,
      score: Number(entry.score),
      gamesPlayed: entry.games_played,
      gamesWon: entry.games_won,
      winRate: entry.games_played > 0 ? entry.games_won / entry.games_played : 0,
      winStreak: entry.win_streak,
    };
  }

  async getTopPlayers(
    gameId: string,
    limit = 10,
    period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
  ): Promise<{ playerId: string; score: number; rank: number }[]> {
    const entries = await this.leaderboardRepo.find({
      where: { game_id: gameId, period },
      order: { score: 'DESC' },
      take: limit,
    });

    return entries.map((entry, i) => ({
      playerId: entry.player_id,
      score: Number(entry.score),
      rank: i + 1,
    }));
  }

  async resetPeriod(gameId: string, period: LeaderboardPeriod): Promise<void> {
    await this.leaderboardRepo.delete({ game_id: gameId, period });
    this.logger.log(`Reset leaderboard for ${gameId} (${period})`);
  }

  private async recalculateRanks(gameId: string, period: LeaderboardPeriod): Promise<void> {
    const entries = await this.leaderboardRepo.find({
      where: { game_id: gameId, period },
      order: { score: 'DESC' },
    });

    for (let i = 0; i < entries.length; i++) {
      entries[i].rank = i + 1;
    }

    await this.leaderboardRepo.save(entries);
  }
}
