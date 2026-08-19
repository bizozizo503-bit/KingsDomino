import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reward = await queryRunner.manager.findOne(DailyReward, {
        where: { user_id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      let rewardEntity: DailyReward;
      if (!reward) {
        rewardEntity = queryRunner.manager.create(DailyReward, {
          user_id: userId,
          streak: 0,
          last_claim_day: 0,
          last_claim_at: 0,
          is_active: true,
          reward_history: [],
        });
        rewardEntity = await queryRunner.manager.save(rewardEntity);
      } else {
        rewardEntity = reward;
      }

      const now = Date.now();

      if (rewardEntity.last_claim_at > 0) {
        const timeSinceLastClaim = now - rewardEntity.last_claim_at;
        const daysSinceLastClaim = Math.floor(timeSinceLastClaim / this.MS_PER_DAY);

        if (daysSinceLastClaim < 1) {
          throw new BadRequestException('لقد حصلت على مكافأتك اليومية بالفعل');
        }

        if (daysSinceLastClaim > 1) {
          rewardEntity.streak = 1;
        } else {
          rewardEntity.streak += 1;
        }
      } else {
        rewardEntity.streak = 1;
      }

      if (rewardEntity.streak > 7) {
        rewardEntity.streak = 1;
      }

      const dayConfig = this.REWARD_TABLE[rewardEntity.streak - 1];
      const gold = dayConfig.gold;

      await this.walletService.creditWithQueryRunner(
        queryRunner,
        userId,
        gold,
        TransactionSource.DAILY_REWARD,
        `daily_reward:${userId}:${rewardEntity.streak}:${Math.floor(now / 1000)}`,
        undefined,
        { streak: rewardEntity.streak, day: rewardEntity.streak },
      );

      rewardEntity.last_claim_at = now;
      rewardEntity.last_claim_day = rewardEntity.streak;

      if (!rewardEntity.reward_history) {
        rewardEntity.reward_history = [];
      }
      rewardEntity.reward_history.push({
        day: rewardEntity.streak,
        amount: gold,
        claimedAt: now,
      });

      if (rewardEntity.reward_history.length > 30) {
        rewardEntity.reward_history = rewardEntity.reward_history.slice(-30);
      }

      await queryRunner.manager.save(rewardEntity);
      await queryRunner.commitTransaction();

      await this.profileService.addXp(userId, 50);

      this.logger.log(`User ${userId} claimed daily reward: ${gold} gold (streak: ${rewardEntity.streak})`);

      return {
        gold,
        streak: rewardEntity.streak,
        day: rewardEntity.streak,
        message: `حصلت على ${gold} ذهب! (سلسلة: ${rewardEntity.streak}/7)`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
