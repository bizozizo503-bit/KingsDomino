import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

/** Limits operational endpoints that can create or distribute currency. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user?.role === UserRole.ADMIN) {
      return true;
    }

    throw new ForbiddenException('Administrator access is required');
  }
}
