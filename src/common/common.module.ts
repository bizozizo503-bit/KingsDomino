import { Module, Global } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { WsRateLimitGuard } from './guards/ws-rate-limit.guard';

@Global()
@Module({
  providers: [
    WsRateLimitGuard,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [WsRateLimitGuard],
})
export class CommonModule {}
