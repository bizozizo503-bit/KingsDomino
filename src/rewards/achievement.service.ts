import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Achievement,
  AchievementCategory,
  PlayerAchievement,
} from './entities/achievement.entity';
import { WalletService } from '../wallet/wallet.service';
import { TransactionSource } from '../wallet/entities/wallet-transaction.entity';
import { ProfileService } from '../social/profile.service';
import { NotificationService } from '../social/notification.service';
import { NotificationType } from '../social/entities/notification.entity';

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);

  constructor(
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(PlayerAchievement)
    private playerAchievementRepo: Repository<PlayerAchievement>,
    private walletService: WalletService,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private dataSource: DataSource,
  ) {}

  async seedAchievements(): Promise<void> {
    const count = await this.achievementRepo.count();
    if (count > 0) return;

    const achievements: Partial<Achievement>[] = [
      { key: 'first_win', name: 'أول فوز', description: 'افرض مباراة لأول مرة', category: AchievementCategory.GAMEPLAY, tier: 1, xp_reward: 100, gold_reward: 200, requirement: { games_won: 1 } },
      { key: 'win_10', name: 'محترف الفوز', description: 'اربح 10 مباريات', category: AchievementCategory.GAMEPLAY, tier: 2, xp_reward: 300, gold_reward: 500, requirement: { games_won: 10 } },
      { key: 'win_50', name: 'ملك الفوز', description: 'اربح 50 مباراة', category: AchievementCategory.GAMEPLAY, tier: 3, xp_reward: 1000, gold_reward: 2000, requirement: { games_won: 50 } },
      { key: 'win_100', name: 'أسطورة الفوز', description: 'اربح 100 مباراة', category: AchievementCategory.MILESTONE, tier: 4, xp_reward: 5000, gold_reward: 10000, requirement: { games_won: 100 } },
      { key: 'play_10', name: 'لاعب نشط', description: 'العب 10 مباريات', category: AchievementCategory.GAMEPLAY, tier: 1, xp_reward: 50, gold_reward: 100, requirement: { games_played: 10 } },
      { key: 'play_100', name: 'لاعب مخضرم', description: 'العب 100 مباراة', category: AchievementCategory.GAMEPLAY, tier: 2, xp_reward: 500, gold_reward: 1000, requirement: { games_played: 100 } },
      { key: 'play_500', name: 'لاعب أسطوري', description: 'العب 500 مباراة', category: AchievementCategory.MILESTONE, tier: 3, xp_reward: 2500, gold_reward: 5000, requirement: { games_played: 500 } },
      { key: 'streak_3', name: 'سلسلة متوسطة', description: 'اربح 3 مباريات متتالية', category: AchievementCategory.STREAK, tier: 1, xp_reward: 150, gold_reward: 300, requirement: { win_streak: 3 } },
      { key: 'streak_5', name: 'سلسلة قوية', description: 'اربح 5 مباريات متتالية', category: AchievementCategory.STREAK, tier: 2, xp_reward: 400, gold_reward: 800, requirement: { win_streak: 5 } },
      { key: 'streak_10', name: 'سلسلة لا تتوقف', description: 'اربح 10 مباريات متتالية', category: AchievementCategory.STREAK, tier: 3, xp_reward: 1500, gold_reward: 3000, requirement: { win_streak: 10 } },
      { key: 'add_friend', name: 'اجتماعي', description: 'أضف صديق واحد', category: AchievementCategory.SOCIAL, tier: 1, xp_reward: 50, gold_reward: 100, requirement: { friends_added: 1 } },
      { key: 'add_10_friends', name: 'اجتماعي جداً', description: 'أضف 10 أصدقاء', category: AchievementCategory.SOCIAL, tier: 2, xp_reward: 200, gold_reward: 400, requirement: { friends_added: 10 } },
      { key: 'level_5', name: 'تصعيد', description: ' reached level 5', category: AchievementCategory.MILESTONE, tier: 1, xp_reward: 100, gold_reward: 200, requirement: { level: 5 } },
      { key: 'level_10', name: 'ترقية كبرى', description: ' reached level 10', category: AchievementCategory.MILESTONE, tier: 2, xp_reward: 500, gold_reward: 1000, requirement: { level: 10 } },
      { key: 'level_25', name: 'محترف', description: ' reached level 25', category: AchievementCategory.MILESTONE, tier: 3, xp_reward: 2000, gold_reward: 5000, requirement: { level: 25 } },
      { key: 'daily_3', name: 'التزام يومي', description: 'احصل على مكافأة يومية 3 مرات', category: AchievementCategory.STREAK, tier: 1, xp_reward: 75, gold_reward: 150, requirement: { daily_claims: 3 } },
      { key: 'daily_7', name: 'التزام أسبوعي', description: 'احصل على مكافأة يومية 7 مرات', category: AchievementCategory.STREAK, tier: 2, xp_reward: 250, gold_reward: 500, requirement: { daily_claims: 7 } },
      { key: 'daily_30', name: 'التزام شهري', description: 'احصل على مكافأة يومية 30 مرة', category: AchievementCategory.STREAK, tier: 3, xp_reward: 1000, gold_reward: 2000, requirement: { daily_claims: 30 } },
    ];

    for (const data of achievements) {
      const achievement = this.achievementRepo.create(data);
      await this.achievementRepo.save(achievement);
    }

    this.logger.log(`Seeded ${achievements.length} achievements`);
  }

  async checkAndUpdateProgress(userId: string, stat: string, currentValue: number): Promise<PlayerAchievement[]> {
    const achievements = await this.achievementRepo.find();
    const unlocked: PlayerAchievement[] = [];

    for (const achievement of achievements) {
      if (!achievement.requirement || !(stat in achievement.requirement)) continue;

      const target = achievement.requirement[stat] as number;
      if (target <= 0) continue;

      let playerAch = await this.playerAchievementRepo.findOne({
        where: { user_id: userId, achievement_key: achievement.key },
      });

      if (!playerAch) {
        playerAch = this.playerAchievementRepo.create({
          user_id: userId,
          achievement_key: achievement.key,
          progress: 0,
          target,
          is_claimed: false,
          unlocked_at: 0,
        });
      }

      if (playerAch.unlocked_at > 0) continue;

      playerAch.progress = currentValue;
      playerAch.target = target;

      if (currentValue >= target) {
        playerAch.unlocked_at = Date.now();
        unlocked.push(playerAch);

        this.logger.log(`User ${userId} unlocked achievement: ${achievement.key}`);

        await this.notificationService.sendAchievement(
          userId,
          achievement.name,
          achievement.description,
        );
      }

      await this.playerAchievementRepo.save(playerAch);
    }

    return unlocked;
  }

  async claimAchievement(userId: string, achievementKey: string): Promise<{
    gold: number;
    xp: number;
    message: string;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const playerAch = await queryRunner.manager.findOne(PlayerAchievement, {
        where: { user_id: userId, achievement_key: achievementKey },
        lock: { mode: 'pessimistic_write' },
      });

      if (!playerAch) throw new NotFoundException('Achievement not found');
      if (playerAch.unlocked_at === 0) throw new BadRequestException('Achievement not unlocked');
      if (playerAch.is_claimed) throw new BadRequestException('Already claimed');

      const achievement = await this.achievementRepo.findOne({
        where: { key: achievementKey },
      });

      if (!achievement) throw new NotFoundException('Achievement definition not found');

      if (achievement.gold_reward > 0) {
        await this.walletService.creditWithQueryRunner(
          queryRunner,
          userId,
          achievement.gold_reward,
          TransactionSource.GAME_REWARD,
          `achievement:${achievementKey}:${userId}`,
          undefined,
          { achievement: achievementKey },
        );
      }

      playerAch.is_claimed = true;
      playerAch.claimed_at = Date.now();
      await queryRunner.manager.save(playerAch);

      await queryRunner.commitTransaction();

      if (achievement.xp_reward > 0) {
        await this.profileService.addXp(userId, achievement.xp_reward);
      }

      return {
        gold: achievement.gold_reward,
        xp: achievement.xp_reward,
        message: `حصلت على ${achievement.gold_reward} ذهب و ${achievement.xp_reward} XP!`,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return this.achievementRepo.find({ order: { category: 'ASC', tier: 'ASC' } });
  }

  async getPlayerAchievements(userId: string): Promise<(PlayerAchievement & { achievement?: Achievement })[]> {
    const playerAchs = await this.playerAchievementRepo.find({
      where: { user_id: userId },
      order: { unlocked_at: 'DESC' },
    });

    for (const pa of playerAchs) {
      const ach = await this.achievementRepo.findOne({ where: { key: pa.achievement_key } });
      (pa as any).achievement = ach;
    }

    return playerAchs;
  }

  async getPlayerStats(userId: string): Promise<{
    totalUnlocked: number;
    totalClaimed: number;
    totalPending: number;
    totalGoldEarned: number;
    totalXpEarned: number;
  }> {
    const playerAchs = await this.playerAchievementRepo.find({
      where: { user_id: userId },
    });

    const achievements = await this.achievementRepo.find();
    const achMap = new Map(achievements.map(a => [a.key, a]));

    let totalGold = 0;
    let totalXp = 0;

    for (const pa of playerAchs) {
      if (pa.is_claimed) {
        const ach = achMap.get(pa.achievement_key);
        if (ach) {
          totalGold += ach.gold_reward;
          totalXp += ach.xp_reward;
        }
      }
    }

    return {
      totalUnlocked: playerAchs.filter(pa => pa.unlocked_at > 0).length,
      totalClaimed: playerAchs.filter(pa => pa.is_claimed).length,
      totalPending: playerAchs.filter(pa => pa.unlocked_at > 0 && !pa.is_claimed).length,
      totalGoldEarned: totalGold,
      totalXpEarned: totalXp,
    };
  }
}
