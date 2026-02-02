import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()

@Injectable()
export class TwoFaGuard implements CanActivate {

    constructor(private readonly userService: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const pendingUser = request.cookies['pending_user'];
    if (!pendingUser) {
      throw new UnauthorizedException('No pending 2FA session');
    }

    // You should verify user exists & has 2FA enabled
    const user = await this.userService.findUserById(+pendingUser);
    if (!user) {
      throw new UnauthorizedException('Invalid pending user');
    }

    if (!user.isTwoFAEnabled) {
      throw new UnauthorizedException('2FA is not enabled for this user');
    }

    request.user = {
      id: user.id,
      email: user.email,
      isTwoFAEnabled: true,
    };

    return true;
  }
}
