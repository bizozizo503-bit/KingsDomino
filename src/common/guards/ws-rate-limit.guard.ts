import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsRateLimitGuard implements CanActivate {
  private readonly windows = new WeakMap<Socket, number[]>();
  private readonly limit = 30;
  private readonly windowMs = 1000;

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const now = Date.now();
    const timestamps = (this.windows.get(client) || []).filter(t => now - t < this.windowMs);
    if (timestamps.length >= this.limit) {
      client.emit('error', { message: 'Rate limit exceeded' });
      this.windows.set(client, timestamps);
      return false;
    }
    timestamps.push(now);
    this.windows.set(client, timestamps);
    return true;
  }
}
