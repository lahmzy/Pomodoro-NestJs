import { Controller,Post,Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {

constructor(private authService:AuthService){}

 @Post("register")
  async register(@Body() createUserDto:CreateUserDto):Promise<{token:string}>{

  const token = await this.authService.register(createUserDto)
    return {token}
 }

 @Post("login")
 async login(@Body() loginDto:LoginDto):Promise<{token:string}>{
    const token = await this.authService.login(loginDto);
    return {token}
 }
    
}
