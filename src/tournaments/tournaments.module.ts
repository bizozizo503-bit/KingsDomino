import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament, TournamentParticipant, TournamentRound } from './entities/tournament.entity';
import { TournamentService } from './tournament.service';
import { TournamentsController } from './tournaments.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tournament, TournamentParticipant, TournamentRound]),
    WalletModule,
  ],
  controllers: [TournamentsController],
  providers: [TournamentService],
  exports: [TournamentService],
})
export class TournamentsModule {}
