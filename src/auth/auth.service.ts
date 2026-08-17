import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(username: string, email: string | undefined, password: string, display_name?: string) {
    const password_hash = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      username,
      email,
      password_hash,
      display_name,
    });

    return this.generateTokens(user.id, user.username);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsernameWithPassword(username);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    return this.generateTokens(user.id, user.username);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.is_active) {
        throw new UnauthorizedException('غير مصرح');
      }

      return this.generateTokens(user.id, user.username);
    } catch {
      throw new UnauthorizedException('توكن غير صالح');
    }
  }

  private generateTokens(userId: string, username: string) {
    const payload = { sub: userId, username };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: userId,
        username,
      },
    };
  }
}
