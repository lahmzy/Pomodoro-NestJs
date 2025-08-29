import { IsNotEmpty, IsString, MinLength,IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName:string

  @IsString()
  lastName:string
}
