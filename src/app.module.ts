import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { CouponsModule } from './coupons/coupons.module';
import { RoomsModule } from './rooms/rooms.module';
import { GameModule } from './game/game.module';
import { GamesModule } from './games/games.module';
import { SocialModule } from './social/social.module';
import { RewardsModule } from './rewards/rewards.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { EventsModule } from './events/events.module';

import { User } from './users/entities/user.entity';
import { Wallet } from './wallet/entities/wallet.entity';
import { WalletTransaction } from './wallet/entities/wallet-transaction.entity';
import { Coupon } from './coupons/entities/coupon.entity';
import { CouponRedemption } from './coupons/entities/coupon-redemption.entity';
import { GameSession } from './games/core/entities/game-session.entity';
import { LeaderboardEntry } from './games/core/entities/leaderboard.entity';
import { PlayerProfile } from './social/entities/player-profile.entity';
import { Friendship } from './social/entities/friendship.entity';
import { ChatMessage } from './social/entities/chat-message.entity';
import { Notification } from './social/entities/notification.entity';
import { DailyReward } from './rewards/entities/daily-reward.entity';
import { Achievement, PlayerAchievement } from './rewards/entities/achievement.entity';
import { ShopItem, PlayerInventory, PlayerBoost } from './rewards/entities/shop.entity';
import { Tournament, TournamentParticipant, TournamentRound } from './tournaments/entities/tournament.entity';
import { GameEvent, PlayerEventProgress } from './events/entities/event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '3306')),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'kingsdomino'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 30,
        },
      ],
    }),

    CommonModule,
    UsersModule,
    AuthModule,
    WalletModule,
    CouponsModule,
    RoomsModule,
    GameModule,
    GamesModule,
    SocialModule,
    RewardsModule,
    TournamentsModule,
    EventsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
