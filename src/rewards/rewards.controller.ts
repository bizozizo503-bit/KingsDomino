import { Controller, Get } from '@nestjs/common';

@Controller('api/rewards')
export class RewardsController {
  @Get('daily')
  getDailyReward() {
    return {
      id: 'daily-login',
      title: 'المكافأة اليومية',
      coins: 250,
      claimable: true,
      playMoneyOnly: true,
    };
  }
}
