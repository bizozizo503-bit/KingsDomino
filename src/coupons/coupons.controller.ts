import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CouponsService } from './coupons.service';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';

@Controller('coupons')
@UseGuards(AuthGuard('jwt'))
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('redeem')
  async redeem(@Req() req: any, @Body() dto: RedeemCouponDto) {
    const userId = req.user.id;
    return this.couponsService.redeem(userId, dto.code);
  }
}
