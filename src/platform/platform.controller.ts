import { Controller, Get } from '@nestjs/common';

@Controller('api/platform')
export class PlatformController {
  @Get()
  getPlatform() {
    return {
      name: 'KingsDomino',
      slogan: 'العب. نافس. كن الملك.',
      version: '0.1.0',
      currency: 'Kings Coins',
      moneyMode: 'PLAY_MONEY_ONLY',
      categories: ['domino', 'arcade', 'spin', 'mini'],
    };
  }
}
