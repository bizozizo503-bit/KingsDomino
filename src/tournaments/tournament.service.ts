import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Tournament,
  TournamentStatus,
  TournamentType,
  TournamentParticipant,
  TournamentRound,
} from './entities/tournament.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionSource } from '../wallet/entities/wallet-transaction.entity';

@Injectable()
export class TournamentService {
  private readonly logger = new Logger(TournamentService.name);

  constructor(
    @InjectRepository(Tournament)
    private tournamentRepo: Repository<Tournament>,
    @InjectRepository(TournamentParticipant)
    private participantRepo: Repository<TournamentParticipant>,
    @InjectRepository(TournamentRound)
    private roundRepo: Repository<TournamentRound>,
    private walletService: WalletService,
    private dataSource: DataSource,
  ) {}

  async createTournament(data: {
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
  }): Promise<Tournament> {
    const tournament = this.tournamentRepo.create({
      name: data.name,
      description: data.description,
      game_id: data.gameId,
      type: data.type || TournamentType.SINGLE_ELIMINATION,
      status: TournamentStatus.WAITING,
      max_participants: data.maxParticipants,
      entry_fee: data.entryFee || 0,
      start_at: data.startAt,
      registration_open_at: Date.now(),
      registration_close_at: data.startAt - 60000,
      rewards: data.rewards || {
        first: { gold: 5000, xp: 1000 },
        second: { gold: 2500, xp: 500 },
        third: { gold: 1000, xp: 250 },
      },
      isRanked: data.isRanked || false,
      rules: data.rules,
    });

    return this.tournamentRepo.save(tournament);
  }

  async joinTournament(tournamentId: string, userId: string): Promise<TournamentParticipant> {
    const tournament = await this.getTournament(tournamentId);

    if (tournament.status !== TournamentStatus.WAITING) {
      throw new BadRequestException('البطولة ليست مفتوحة للتسجيل');
    }

    if (tournament.current_participants >= tournament.max_participants) {
      throw new BadRequestException('البطولة ممتلئة');
    }

    const existing = await this.participantRepo.findOne({
      where: { tournament_id: tournamentId, user_id: userId },
    });
    if (existing) {
      throw new ConflictException('أنت مسجل بالفعل في هذه البطولة');
    }

    if (tournament.entry_fee > 0) {
      await this.walletService.debit(
        userId,
        tournament.entry_fee,
        TransactionSource.OTHER,
        `tournament_entry:${tournamentId}:${userId}:${Date.now()}`,
        tournamentId,
        { tournament: tournamentId },
      );
    }

    tournament.current_participants += 1;
    await this.tournamentRepo.save(tournament);

    const participant = this.participantRepo.create({
      tournament_id: tournamentId,
      user_id: userId,
      joined_at: Date.now(),
    });

    return this.participantRepo.save(participant);
  }

  async leaveTournament(tournamentId: string, userId: string): Promise<void> {
    const tournament = await this.getTournament(tournamentId);

    if (tournament.status !== TournamentStatus.WAITING) {
      throw new BadRequestException('لا يمكن المغادرة بعد بدء البطولة');
    }

    const participant = await this.participantRepo.findOne({
      where: { tournament_id: tournamentId, user_id: userId },
    });

    if (!participant) throw new NotFoundException('أنت غير مسجل في هذه البطولة');

    await this.participantRepo.remove(participant);

    tournament.current_participants -= 1;
    await this.tournamentRepo.save(tournament);

    if (tournament.entry_fee > 0) {
      await this.walletService.credit(
        userId,
        tournament.entry_fee,
        TransactionSource.OTHER,
        `tournament_refund:${tournamentId}:${userId}:${Date.now()}`,
        tournamentId,
        { tournament: tournamentId },
      );
    }
  }

  async startTournament(tournamentId: string): Promise<TournamentRound> {
    const tournament = await this.getTournament(tournamentId);

    if (tournament.status !== TournamentStatus.WAITING) {
      throw new BadRequestException('البطولة بدأت بالفعل');
    }

    if (tournament.current_participants < 2) {
      throw new BadRequestException('يجب أن يكون هناك لاعبان على الأقل');
    }

    tournament.status = TournamentStatus.IN_PROGRESS;
    tournament.registration_close_at = Date.now();
    await this.tournamentRepo.save(tournament);

    const participants = await this.participantRepo.find({
      where: { tournament_id: tournamentId },
    });

    const firstRound = await this.generateFirstRound(participants, tournament);

    this.logger.log(`Tournament ${tournamentId} started with ${participants.length} participants`);

    return firstRound;
  }

  async recordMatchResult(
    tournamentId: string,
    matchId: string,
    winnerId: string,
    loserId: string,
    score: string,
    sessionId?: string,
  ): Promise<TournamentRound | null> {
    const tournament = await this.getTournament(tournamentId);

    const currentRound = await this.getCurrentRound(tournamentId);

    const match = currentRound.matches.find((m: any) => m.matchId === matchId);
    if (!match) throw new NotFoundException('Match not found');

    match.winner = winnerId;
    match.score = score;
    match.sessionId = sessionId;

    const winner = await this.participantRepo.findOne({
      where: { tournament_id: tournamentId, user_id: winnerId },
    });
    const loser = await this.participantRepo.findOne({
      where: { tournament_id: tournamentId, user_id: loserId },
    });

    if (winner) {
      winner.wins += 1;
      winner.score += 3;
      if (!winner.match_history) winner.match_history = [];
      winner.match_history.push({ opponentId: loserId, won: true, score: 0, round: currentRound.round_number });
      await this.participantRepo.save(winner);
    }

    if (loser) {
      loser.losses += 1;
      if (!loser.match_history) loser.match_history = [];
      loser.match_history.push({ opponentId: winnerId, won: false, score: 0, round: currentRound.round_number });
      await this.participantRepo.save(loser);
    }

    const allMatchesComplete = currentRound.matches.every((m: any) => m.winner);

    if (allMatchesComplete) {
      currentRound.is_complete = true;
      currentRound.finished_at = Date.now();
      await this.roundRepo.save(currentRound);

      return this.advanceToNextRound(tournamentId, tournament);
    }

    await this.roundRepo.save(currentRound);
    return null;
  }

  async finishTournament(tournamentId: string): Promise<Tournament> {
    const tournament = await this.getTournament(tournamentId);

    const participants = await this.participantRepo.find({
      where: { tournament_id: tournamentId },
      order: { score: 'DESC', wins: 'DESC' },
    });

    participants.forEach((p, i) => {
      p.final_rank = i + 1;
    });
    await this.participantRepo.save(participants);

    const winner = participants[0];
    tournament.winner_id = winner?.user_id;
    tournament.status = TournamentStatus.FINISHED;
    tournament.end_at = Date.now();
    await this.tournamentRepo.save(tournament);

    await this.distributeRewards(tournament, participants);

    this.logger.log(`Tournament ${tournamentId} finished. Winner: ${winner?.user_id}`);

    return tournament;
  }

  async getTournament(tournamentId: string): Promise<Tournament> {
    const tournament = await this.tournamentRepo.findOne({ where: { id: tournamentId } });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async getTournaments(status?: TournamentStatus): Promise<Tournament[]> {
    const where: any = {};
    if (status) where.status = status;
    return this.tournamentRepo.find({ where, order: { start_at: 'ASC' } });
  }

  async getMyTournaments(userId: string): Promise<(TournamentParticipant & { tournament?: Tournament })[]> {
    const participations = await this.participantRepo.find({
      where: { user_id: userId },
      order: { joined_at: 'DESC' },
    });

    for (const p of participations) {
      const t = await this.tournamentRepo.findOne({ where: { id: p.tournament_id } });
      (p as any).tournament = t;
    }

    return participations;
  }

  async getParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    return this.participantRepo.find({
      where: { tournament_id: tournamentId },
      order: { score: 'DESC' },
    });
  }

  async getRounds(tournamentId: string): Promise<TournamentRound[]> {
    return this.roundRepo.find({
      where: { tournament_id: tournamentId },
      order: { round_number: 'ASC' },
    });
  }

  async getCurrentRound(tournamentId: string): Promise<TournamentRound> {
    const round = await this.roundRepo.findOne({
      where: { tournament_id: tournamentId, is_complete: false },
      order: { round_number: 'DESC' },
    });
    if (!round) throw new NotFoundException('No active round');
    return round;
  }

  private async generateFirstRound(participants: TournamentParticipant[], tournament: Tournament): Promise<TournamentRound> {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const matches: TournamentRound['matches'] = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        matches.push({
          matchId: `R1-M${Math.floor(i / 2) + 1}`,
          player1: shuffled[i].user_id,
          player2: shuffled[i + 1].user_id,
        });
      } else {
        matches.push({
          matchId: `R1-M${Math.floor(i / 2) + 1}`,
          player1: shuffled[i].user_id,
          player2: null as any,
          winner: shuffled[i].user_id,
          score: 'BYE',
        });
      }
    }

    const round = this.roundRepo.create({
      tournament_id: tournament.id,
      round_number: 1,
      matches,
      is_complete: false,
      started_at: Date.now(),
    });

    return this.roundRepo.save(round);
  }

  private async advanceToNextRound(tournamentId: string, tournament: Tournament): Promise<TournamentRound | null> {
    const currentRound = await this.getCurrentRound(tournamentId);

    const winners: string[] = currentRound.matches
      .filter((m: any) => m.winner)
      .map((m: any) => m.winner);

    if (winners.length <= 1) {
      await this.finishTournament(tournamentId);
      return null;
    }

    const shuffled = [...winners].sort(() => Math.random() - 0.5);
    const matches: TournamentRound['matches'] = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        matches.push({
          matchId: `R${currentRound.round_number + 1}-M${Math.floor(i / 2) + 1}`,
          player1: shuffled[i],
          player2: shuffled[i + 1],
        });
      } else {
        matches.push({
          matchId: `R${currentRound.round_number + 1}-M${Math.floor(i / 2) + 1}`,
          player1: shuffled[i],
          player2: null as any,
          winner: shuffled[i],
          score: 'BYE',
        });
      }
    }

    const nextRound = this.roundRepo.create({
      tournament_id: tournamentId,
      round_number: currentRound.round_number + 1,
      matches,
      is_complete: false,
      started_at: Date.now(),
    });

    return this.roundRepo.save(nextRound);
  }

  private async distributeRewards(tournament: Tournament, participants: TournamentParticipant[]): Promise<void> {
    const rewards = tournament.rewards || {};

    if (rewards.first && participants[0]) {
      await this.walletService.credit(
        participants[0].user_id,
        rewards.first.gold || 0,
        TransactionSource.TOURNAMENT_WIN,
        `tournament:${tournament.id}:1st:${participants[0].user_id}`,
        tournament.id,
        { tournament: tournament.id, rank: 1 },
      );
    }

    if (rewards.second && participants[1]) {
      await this.walletService.credit(
        participants[1].user_id,
        rewards.second.gold || 0,
        TransactionSource.TOURNAMENT_WIN,
        `tournament:${tournament.id}:2nd:${participants[1].user_id}`,
        tournament.id,
        { tournament: tournament.id, rank: 2 },
      );
    }

    if (rewards.third && participants[2]) {
      await this.walletService.credit(
        participants[2].user_id,
        rewards.third.gold || 0,
        TransactionSource.TOURNAMENT_WIN,
        `tournament:${tournament.id}:3rd:${participants[2].user_id}`,
        tournament.id,
        { tournament: tournament.id, rank: 3 },
      );
    }
  }
}
