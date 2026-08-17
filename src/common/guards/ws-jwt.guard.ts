import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      client.emit('gameError', { message: 'غير مصرح — يلزم تسجيل الدخول' });
      client.disconnect();
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      (client as any).userId = payload.sub;
      (client as any).username = payload.username;
      return true;
    } catch {
      client.emit('gameError', { message: 'توكن غير صالح' });
      client.disconnect();
      return false;
    }
  }
}
