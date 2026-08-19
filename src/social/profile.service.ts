import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerProfile } from './entities/player-profile.entity';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  private readonly XP_PER_LEVEL = 1000;

  constructor(
    @InjectRepository(PlayerProfile)
    private profileRepo: Repository<PlayerProfile>,
  ) {}

  async getOrCreateProfile(userId: string, username: string): Promise<PlayerProfile> {
    let profile = await this.profileRepo.findOne({ where: { user_id: userId } });
    if (!profile) {
      profile = this.profileRepo.create({
        user_id: userId,
        display_name: username,
        level: 1,
        xp: '0',
        total_xp: '0',
      });
      profile = await this.profileRepo.save(profile);
    }
    return profile;
  }

  async getProfile(userId: string): Promise<PlayerProfile> {
    const profile = await this.profileRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(userId: string, data: {
    display_name?: string;
    avatar_url?: string;
    avatar_frame?: string;
    country?: string;
    bio?: string;
  }): Promise<PlayerProfile> {
    const profile = await this.getOrCreateProfile(userId, '');

    if (data.display_name !== undefined) profile.display_name = data.display_name;
    if (data.avatar_url !== undefined) profile.avatar_url = data.avatar_url;
    if (data.avatar_frame !== undefined) profile.avatar_frame = data.avatar_frame;
    if (data.country !== undefined) profile.country = data.country;
    if (data.bio !== undefined) profile.bio = data.bio;

    return this.profileRepo.save(profile);
  }

  async addXp(userId: string, amount: number): Promise<{
    profile: PlayerProfile;
    levelsGained: number;
    newLevel: number;
  }> {
    const profile = await this.getOrCreateProfile(userId, '');

    const currentXp = BigInt(profile.xp);
    const newXp = currentXp + BigInt(amount);
    profile.xp = newXp.toString();

    const totalXp = BigInt(profile.total_xp) + BigInt(amount);
    profile.total_xp = totalXp.toString();

    const oldLevel = profile.level;
    let newLevel = oldLevel;
    let xpRemaining = Number(newXp);
    let levelsGained = 0;

    while (xpRemaining >= this.getXpForLevel(newLevel)) {
      xpRemaining -= this.getXpForLevel(newLevel);
      newLevel += 1;
      levelsGained += 1;
    }

    profile.level = newLevel;
    profile.xp = xpRemaining.toString();

    await this.profileRepo.save(profile);

    this.logger.log(`User ${userId} gained ${amount} XP, now level ${newLevel}`);

    return { profile, levelsGained, newLevel };
  }

  async recordGameResult(userId: string, won: boolean, goldEarned: number): Promise<PlayerProfile> {
    const profile = await this.getOrCreateProfile(userId, '');

    profile.games_played += 1;

    if (won) {
      profile.games_won += 1;
      profile.current_win_streak += 1;
      profile.best_win_streak = Math.max(profile.best_win_streak, profile.current_win_streak);
    } else {
      profile.current_win_streak = 0;
    }

    const totalGold = BigInt(profile.total_gold_earned) + BigInt(goldEarned);
    profile.total_gold_earned = totalGold.toString();

    await this.profileRepo.save(profile);
    return profile;
  }

  async getLeaderboard(limit = 50): Promise<PlayerProfile[]> {
    return this.profileRepo.find({
      order: { level: 'DESC', total_xp: 'DESC' },
      take: limit,
    });
  }

  async searchPlayers(query: string, limit = 20): Promise<PlayerProfile[]> {
    return this.profileRepo
      .createQueryBuilder('profile')
      .where('profile.display_name LIKE :query', { query: `%${query}%` })
      .orWhere('profile.user_id LIKE :query', { query: `%${query}%` })
      .take(limit)
      .getMany();
  }

  async setOnline(userId: string, online: boolean): Promise<void> {
    await this.profileRepo.update(
      { user_id: userId },
      { is_online: online, last_seen_at: Date.now() },
    );
  }

  private getXpForLevel(level: number): number {
    return this.XP_PER_LEVEL + (level - 1) * 500;
  }
}
