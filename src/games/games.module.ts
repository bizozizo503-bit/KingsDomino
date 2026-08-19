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
import { RewardsModule } from '../rewards/rewards.module';
import { SocialModule } from '../social/social.module';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';

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
    forwardRef(() => RewardsModule),
    SocialModule,
    UsersModule,
    CommonModule,
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
