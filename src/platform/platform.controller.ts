import { Controller, Get } from '@nestjs/common';

@Controller('platform')
export class PlatformController {
  @Get('config')
  getConfig() {
    return {
      name: 'Kings Domino',
      nameAr: 'ملوك الدومينو',
      version: 'platform-foundation-1',
      features: {
        domino: true,
        ai: true,
        rooms: true,
        tournaments: true,
        missions: true,
        shop: true,
        friends: true,
        chat: true,
        notifications: true,
        admin: true,
      },
      economy: {
        type: 'virtual',
        clientBalanceMutation: false,
      },
    };
  }
}
