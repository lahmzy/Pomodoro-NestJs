import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { TwoFAService } from './two-fa.service';
import { TwoFaGuard } from './twofa.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private twoFAService: TwoFAService,
    private configService: ConfigService,
  ) { }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ token: string }> {
    const token = await this.authService.register(createUserDto);
    return { token };
  }

  @Post('login')
  async login(
    @Body() loginDTO: LoginDto,
    @Res({ passthrough: true }) res: any,
  ): Promise<{ message: string; twoFaRequired?: boolean }> {
    const { token, user } = await this.authService.login(loginDTO);

    if (user.isTwoFAEnabled) {
      res.cookie('pending_user', user.id, {
        httpOnly: true,
        sameSite: 'lax', // Use 'lax' for CSRF protection
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        maxAge: 5 * 60 * 1000, // 5 minutes
      });
      return { message: '2FA required', twoFaRequired: true };
    }
    // return { token }; // Return the generated JWT token
    const isProd = this.configService.get('NODE_ENV') === 'production';

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true, // Must be true for sameSite: 'none'
      sameSite: isProd ? 'none' : 'lax', // 'none' for cross-site prod, 'lax' for local
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    return { message: 'Login successful, token set in cookie' };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // Use JWT guard to protect this route
  async profile(
    @Req() req: any,
  ): Promise<{ email: string; isTwoFAEnabled: boolean }> {
    const user = await this.userService.findUserByEmail(req.user.email);
    if (!user) {
      throw new Error('User not found');
    }
    return { email: user.email, isTwoFAEnabled: user.isTwoFAEnabled };
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: any,
  ): Promise<{ message: string }> {
    res.clearCookie('access_token'); // Clear the cookie
    return { message: 'Logout successful, cookie cleared' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ): Promise<{ message: string }> {
    const user = req.user; // User information from Google
    const token = await this.authService.socialLogin(user);

    const isProd = this.configService.get('NODE_ENV') === 'production';

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true, // Must be true for sameSite: 'none'
      sameSite: isProd ? 'none' : 'lax', // 'none' for cross-site prod, 'lax' for local
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';// Redirect to your frontend or desired URL
    return res.redirect(frontendUrl);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth(@Req() req: any) { }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ): Promise<{ message: string }> {
    const user = req.user; // User information from Google
    const token = await this.authService.socialLogin(user);

    const isProd = this.configService.get('NODE_ENV') === 'production';

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true, // Must be true for sameSite: 'none'
      sameSite: isProd ? 'none' : 'lax', // 'none' for cross-site prod, 'lax' for local
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';// Redirect to your frontend or desired URL
    return res.redirect(frontendUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/enable')
  async enableTwoFactorAuth(@Req() req: any, @Body('code') code: string) {
    const user = await this.userService.findUserByEmail(req.user.email);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not set up for this user');
    }
    const verified = this.twoFAService.verifyCode(user.twoFactorSecret, code);
    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
    await this.userService.enableTwoFA(user.id);
    return { message: '2FA enabled successfully', success: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/generate')
  async generateTwoFactorAuthSecret(@Req() req: any) {
    const user = req.user;
    const secret = this.twoFAService.generateSecret(user.email);
    await this.userService.setTwoFASecret(user.id, secret.base32);
    if (!secret.otpauth_url) {
      throw new Error('OTP Auth URL is missing');
    }
    const qrCode = await this.twoFAService.generateQRCode(secret.otpauth_url);
    return { qrCode, secret: secret.base32 };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/disable')
  async disableTwoFactorAuth(@Req() req: any) {
    const user = await this.userService.findUserByEmail(req.user.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.userService.disableTwoFA(user.id);
    return { message: '2FA disabled successfully', success: true };
  }

  @UseGuards(TwoFaGuard)
  @Post('2fa/verify')
  async verifyTwoFactorAuthCode(
    @Req() req: any,
    @Body('code') code: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const user = await this.userService.findUserById(+req.user.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not set up for this user');
    }

    const verified = this.twoFAService.verifyCode(user.twoFactorSecret, code);
    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    const payload = { id: user.id, email: user.email };
    const token = this.authService.generateJwtToken(payload);

    res.clearCookie('pending_user'); // important cleanup
    const isProd = this.configService.get('NODE_ENV') === 'production';

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true, // Must be true for sameSite: 'none'
      sameSite: isProd ? 'none' : 'lax', // 'none' for cross-site prod, 'lax' for local
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { message: '2FA verification successful', success: true };
  }
}
