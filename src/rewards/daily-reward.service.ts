import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyReward } from './entities/daily-reward.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionSource } from '../wallet/entities/wallet-transaction.entity';
import { ProfileService } from '../social/profile.service';

@Injectable()
export class DailyRewardService {
  private readonly logger = new Logger(DailyRewardService.name);

  private readonly REWARD_TABLE = [
    { day: 1, gold: 100 },
    { day: 2, gold: 150 },
    { day: 3, gold: 200 },
    { day: 4, gold: 250 },
    { day: 5, gold: 300 },
    { day: 6, gold: 400 },
    { day: 7, gold: 500 },
  ];

  private readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(DailyReward)
    private dailyRewardRepo: Repository<DailyReward>,
    private walletService: WalletService,
    private profileService: ProfileService,
  ) {}

  async getOrCreate(userId: string): Promise<DailyReward> {
    let reward = await this.dailyRewardRepo.findOne({ where: { user_id: userId } });
    if (!reward) {
      reward = this.dailyRewardRepo.create({
        user_id: userId,
        streak: 0,
        last_claim_day: 0,
        last_claim_at: 0,
        is_active: true,
        reward_history: [],
      });
      reward = await this.dailyRewardRepo.save(reward);
    }
    return reward;
  }

  async claimReward(userId: string): Promise<{
    gold: number;
    streak: number;
    day: number;
    message: string;
  }> {
    const reward = await this.getOrCreate(userId);
    const now = Date.now();

    if (reward.last_claim_at > 0) {
      const timeSinceLastClaim = now - reward.last_claim_at;
      const daysSinceLastClaim = Math.floor(timeSinceLastClaim / this.MS_PER_DAY);

      if (daysSinceLastClaim < 1) {
        throw new BadRequestException('لقد حصلت على مكافأتك اليومية بالفعل');
      }

      if (daysSinceLastClaim > 1) {
        reward.streak = 1;
      } else {
        reward.streak += 1;
      }
    } else {
      reward.streak = 1;
    }

    if (reward.streak > 7) {
      reward.streak = 1;
    }

    const dayConfig = this.REWARD_TABLE[reward.streak - 1];
    const gold = dayConfig.gold;

    await this.walletService.credit(
      userId,
      gold,
      TransactionSource.DAILY_REWARD,
      `daily_reward:${userId}:${now}`,
      undefined,
      { streak: reward.streak, day: reward.streak },
    );

    await this.profileService.addXp(userId, 50);

    reward.last_claim_at = now;
    reward.last_claim_day = reward.streak;

    if (!reward.reward_history) {
      reward.reward_history = [];
    }
    reward.reward_history.push({
      day: reward.streak,
      amount: gold,
      claimedAt: now,
    });

    if (reward.reward_history.length > 30) {
      reward.reward_history = reward.reward_history.slice(-30);
    }

    await this.dailyRewardRepo.save(reward);

    this.logger.log(`User ${userId} claimed daily reward: ${gold} gold (streak: ${reward.streak})`);

    return {
      gold,
      streak: reward.streak,
      day: reward.streak,
      message: `حصلت على ${gold} ذهب! (سلسلة: ${reward.streak}/7)`,
    };
  }

  async getStatus(userId: string): Promise<{
    canClaim: boolean;
    streak: number;
    nextReward: number;
    lastClaimAt: number;
    timeUntilNext: number;
  }> {
    const reward = await this.getOrCreate(userId);
    const now = Date.now();
    const timeSinceLastClaim = reward.last_claim_at > 0 ? now - reward.last_claim_at : Infinity;
    const daysSinceLastClaim = Math.floor(timeSinceLastClaim / this.MS_PER_DAY);

    let currentStreak = reward.streak;
    if (daysSinceLastClaim > 1 && reward.last_claim_at > 0) {
      currentStreak = 0;
    }

    const canClaim = daysSinceLastClaim >= 1 || reward.last_claim_at === 0;
    const nextDay = currentStreak >= 7 ? 1 : currentStreak + 1;
    const nextReward = this.REWARD_TABLE[nextDay - 1]?.gold || 100;

    const timeUntilNext = canClaim ? 0 : this.MS_PER_DAY - timeSinceLastClaim;

    return {
      canClaim,
      streak: currentStreak,
      nextReward,
      lastClaimAt: reward.last_claim_at,
      timeUntilNext,
    };
  }

  async getHistory(userId: string, limit = 7): Promise<Array<{ day: number; amount: number; claimedAt: number }>> {
    const reward = await this.getOrCreate(userId);
    return (reward.reward_history || []).slice(-limit);
  }
}
