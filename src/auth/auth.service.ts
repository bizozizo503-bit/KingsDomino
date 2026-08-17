import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, email: string, password: string) {
    const password_hash = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      username,
      email,
      password_hash,
    });

    return this.generateToken(user);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const valid = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!valid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    return this.generateToken(user);
  }

  private generateToken(user: {
    id: string;
    username: string;
  }) {
    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        username: user.username,
      }),
    };
  }
}
