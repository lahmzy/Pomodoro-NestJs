import { Body, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
    async register(@Body() createUserDto:CreateUserDto){

        const hashedPassword = await bcrypt.hash(createUserDto.password,10)

        createUserDto.password = hashedPassword


        return createUserDto
    }
}
