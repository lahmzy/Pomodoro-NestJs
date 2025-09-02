import { Body, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from "bcrypt"
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {

    constructor(private readonly userService:UsersService){}
    async register(@Body() createUserDto:CreateUserDto){

        const hashedPassword = await bcrypt.hash(createUserDto.password,10)

        createUserDto.password = hashedPassword

        return  await this.userService.createUser(createUserDto)

       
    }
}
