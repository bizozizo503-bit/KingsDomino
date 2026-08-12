import { Controller, Get } from '@nestjs/common';

@Controller('api/wallet')
export class WalletController {
  @Get('demo')
  getDemoWallet() {
    return {
      currency: 'Kings Coins',
      balance: 1000,
      playMoneyOnly: true,
    };
  }
}
