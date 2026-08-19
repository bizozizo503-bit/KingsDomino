import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyReward } from './entities/daily-reward.entity';
import { Achievement, PlayerAchievement } from './entities/achievement.entity';
import { ShopItem, PlayerInventory, PlayerBoost } from './entities/shop.entity';
import { DailyRewardService } from './daily-reward.service';
import { AchievementService } from './achievement.service';
import { ShopService } from './shop.service';
import { RewardsController } from './rewards.controller';
import { WalletModule } from '../wallet/wallet.module';
import { SocialModule } from '../social/social.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyReward, Achievement, PlayerAchievement, ShopItem, PlayerInventory, PlayerBoost]),
    WalletModule,
    SocialModule,
  ],
  controllers: [RewardsController],
  providers: [DailyRewardService, AchievementService, ShopService],
  exports: [DailyRewardService, AchievementService, ShopService],
})
export class RewardsModule implements OnModuleInit {
  constructor(
    private readonly achievementService: AchievementService,
    private readonly shopService: ShopService,
  ) {}

  async onModuleInit() {
    await this.achievementService.seedAchievements();
    await this.shopService.seedShop();
  }
}
