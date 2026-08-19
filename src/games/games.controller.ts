import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GameRegistry } from './core/game-registry.service';
import { GameSessionService } from './core/game-session.service';
import { LeaderboardService } from './core/leaderboard.service';

@Controller('games')
@UseGuards(AuthGuard('jwt'))
export class GamesController {
  constructor(
    private readonly gameRegistry: GameRegistry,
    private readonly sessionService: GameSessionService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @Get()
  listGames() {
    return this.gameRegistry.getAllGames().map(g => ({
      id: g.gameId,
      name: g.metadata.name,
      nameAr: g.metadata.nameAr,
      category: g.metadata.category,
      minPlayers: g.metadata.minPlayers,
      maxPlayers: g.metadata.maxPlayers,
      isRanked: g.metadata.isRanked,
      icon: g.metadata.icon,
    }));
  }

  @Get(':gameId')
  getGame(@Param('gameId') gameId: string) {
    const game = this.gameRegistry.getGame(gameId);
    if (!game) return { error: 'Game not found' };

    return {
      id: game.gameId,
      name: game.metadata.name,
      nameAr: game.metadata.nameAr,
      category: game.metadata.category,
      minPlayers: game.metadata.minPlayers,
      maxPlayers: game.metadata.maxPlayers,
      isRanked: game.metadata.isRanked,
    };
  }

  @Get(':gameId/leaderboard')
  async getLeaderboard(
    @Param('gameId') gameId: string,
    @Query('period') period?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leaderboardService.getLeaderboard(
      gameId,
      (period as any) || 'all_time',
      Number(limit) || 50,
    );
  }

  @Get('me/stats')
  async getMyStats(@Req() req: any, @Query('gameId') gameId?: string) {
    return this.sessionService.getPlayerStats(req.user.id, gameId);
  }

  @Get('me/recent')
  async getMyRecentSessions(@Req() req: any, @Query('limit') limit?: string) {
    return this.sessionService.getRecentSessions(req.user.id, Number(limit) || 10);
  }
}
