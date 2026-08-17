import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  async getMyWallet(@Req() req: any) {
    return this.walletService.getBalance(req.user.id);
  }

  @Get('me/transactions')
  async getMyTransactions(@Req() req: any, @Query() query: any) {
    const limit = Number(query.limit) || 20;
    const offset = Number(query.offset) || 0;
    return this.walletService.getTransactions(req.user.id, limit, offset);
  }
}
