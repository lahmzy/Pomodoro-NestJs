import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService, // Assuming you have JwtService injected for token generation
  ) {}
  async register(@Body() createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    createUserDto.password = hashedPassword;

    const user = await this.userService.createUser(createUserDto);

    console.log('Saved user:', user);

    return this.jwtService.sign({ id: user.id, email: user.email }); // Generate JWT token after user creation
  }

 async login(loginDto: LoginDto): Promise<{ user: any; token: string }> {
    const user = await this.userService.findUserByEmail(loginDto.email);
    // if user does not exist or password is incorrect, throw an error
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ id: user.id, email: user.email });
    return { user, token };
  }

 async socialLogin(userData: {
    email: string;
    firstName: string;
    lastName: string;
    provider: string;
  }) {
    let user = await this.userService.findUserByEmail(userData.email);
    if (!user) {
      user = await this.userService.createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName, // Assuming lastName is optional or not provided
        password: '', // Password can be empty for social logins
      });
    }
    return this.jwtService.sign({ id: user.id, email: user.email });
  }

  generateJwtToken(payload: { id: number; email: string }): string {
    return this.jwtService.sign(payload);
  }
}
