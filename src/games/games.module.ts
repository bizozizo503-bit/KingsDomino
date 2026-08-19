import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GameRegistry } from './core/game-registry.service';
import { GameSessionService } from './core/game-session.service';
import { GameSession } from './core/entities/game-session.entity';
import { LeaderboardEntry } from './core/entities/leaderboard.entity';
import { LeaderboardService } from './core/leaderboard.service';
import { MatchmakingService } from './core/matchmaking.service';
import { GamesGateway } from './games.gateway';
import { GamesController } from './games.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameSession, LeaderboardEntry]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [GamesController],
  providers: [
    GameRegistry,
    GameSessionService,
    LeaderboardService,
    MatchmakingService,
    GamesGateway,
  ],
  exports: [
    GameRegistry,
    GameSessionService,
    LeaderboardService,
    MatchmakingService,
  ],
})
export class GamesModule {}
