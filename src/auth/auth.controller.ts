import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ token: string }> {
    const token = await this.authService.register(createUserDto);
    return { token };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    const token = await this.authService.login(loginDto);
    return { token };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt')) // Use JWT guard to protect this route
  async profile(@Req() req: any): Promise<{ email: string }> {
    const user = await this.userService.findUserByEmail(req.user.email);
    if (!user) {
      throw new Error('User not found');
    }
    return { email: user.email };
  }
}
