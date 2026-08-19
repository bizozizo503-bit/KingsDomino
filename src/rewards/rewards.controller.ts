import { Controller, Get, Post, Param, Query, Req, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DailyRewardService } from './daily-reward.service';
import { AchievementService } from './achievement.service';
import { ShopService } from './shop.service';

@Controller('rewards')
@UseGuards(AuthGuard('jwt'))
export class RewardsController {
  constructor(
    private readonly dailyRewardService: DailyRewardService,
    private readonly achievementService: AchievementService,
    private readonly shopService: ShopService,
  ) {}

  @Post('daily/claim')
  async claimDailyReward(@Req() req: any) {
    return this.dailyRewardService.claimReward(req.user.id);
  }

  @Get('daily/status')
  async getDailyStatus(@Req() req: any) {
    return this.dailyRewardService.getStatus(req.user.id);
  }

  @Get('daily/history')
  async getDailyHistory(@Req() req: any, @Query('limit') limit?: string) {
    return this.dailyRewardService.getHistory(req.user.id, Number(limit) || 7);
  }

  @Get('achievements')
  async getAllAchievements() {
    return this.achievementService.getAllAchievements();
  }

  @Get('achievements/me')
  async getMyAchievements(@Req() req: any) {
    return this.achievementService.getPlayerAchievements(req.user.id);
  }

  @Get('achievements/stats')
  async getMyAchievementStats(@Req() req: any) {
    return this.achievementService.getPlayerStats(req.user.id);
  }

  @Post('achievements/claim/:key')
  async claimAchievement(@Req() req: any, @Param('key') key: string) {
    return this.achievementService.claimAchievement(req.user.id, key);
  }

  @Get('shop/items')
  async getShopItems(@Query('category') category?: string) {
    return this.shopService.getShopItems(category);
  }

  @Get('shop/featured')
  async getFeaturedItems() {
    return this.shopService.getFeaturedItems();
  }

  @Get('shop/item/:key')
  async getShopItem(@Param('key') key: string) {
    return this.shopService.getItem(key);
  }

  @Post('shop/buy/:key')
  async purchaseItem(@Req() req: any, @Param('key') key: string) {
    return this.shopService.purchaseItem(req.user.id, key);
  }

  @Get('shop/inventory')
  async getMyInventory(@Req() req: any) {
    return this.shopService.getInventory(req.user.id);
  }

  @Post('shop/equip/:key')
  async equipItem(@Req() req: any, @Param('key') key: string) {
    return this.shopService.equipItem(req.user.id, key);
  }

  @Post('shop/unequip/:key')
  async unequipItem(@Req() req: any, @Param('key') key: string) {
    return this.shopService.unequipItem(req.user.id, key);
  }

  @Get('shop/boosts')
  async getMyBoosts(@Req() req: any) {
    return this.shopService.getActiveBoosts(req.user.id);
  }
}
