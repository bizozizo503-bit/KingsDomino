import { Controller, Get, Post, Param, Query, Req, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TournamentService } from './tournament.service';
import { TournamentStatus, TournamentType } from './entities/tournament.entity';

@Controller('tournaments')
@UseGuards(AuthGuard('jwt'))
export class TournamentsController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post('create')
  async createTournament(
    @Req() req: any,
    @Body() body: {
      name: string;
      description?: string;
      gameId: string;
      type?: TournamentType;
      maxParticipants: number;
      entryFee?: number;
      startAt: number;
      rewards?: Record<string, any>;
      isRanked?: boolean;
      rules?: string;
    },
  ) {
    return this.tournamentService.createTournament(body);
  }

  @Get()
  async getTournaments(@Query('status') status?: TournamentStatus) {
    return this.tournamentService.getTournaments(status);
  }

  @Get('me')
  async getMyTournaments(@Req() req: any) {
    return this.tournamentService.getMyTournaments(req.user.id);
  }

  @Get(':id')
  async getTournament(@Param('id') id: string) {
    return this.tournamentService.getTournament(id);
  }

  @Post(':id/join')
  async joinTournament(@Param('id') id: string, @Req() req: any) {
    return this.tournamentService.joinTournament(id, req.user.id);
  }

  @Post(':id/leave')
  async leaveTournament(@Param('id') id: string, @Req() req: any) {
    return this.tournamentService.leaveTournament(id, req.user.id);
  }

  @Post(':id/start')
  async startTournament(@Param('id') id: string) {
    return this.tournamentService.startTournament(id);
  }

  @Post(':id/match/:matchId/result')
  async recordMatchResult(
    @Param('id') id: string,
    @Param('matchId') matchId: string,
    @Body() body: { winnerId: string; loserId: string; score: string; sessionId?: string },
  ) {
    return this.tournamentService.recordMatchResult(id, matchId, body.winnerId, body.loserId, body.score, body.sessionId);
  }

  @Get(':id/participants')
  async getParticipants(@Param('id') id: string) {
    return this.tournamentService.getParticipants(id);
  }

  @Get(':id/rounds')
  async getRounds(@Param('id') id: string) {
    return this.tournamentService.getRounds(id);
  }

  @Get(':id/current-round')
  async getCurrentRound(@Param('id') id: string) {
    return this.tournamentService.getCurrentRound(id);
  }

  @Post(':id/finish')
  async finishTournament(@Param('id') id: string) {
    return this.tournamentService.finishTournament(id);
  }
}
