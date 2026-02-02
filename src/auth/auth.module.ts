import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { GithubStrategy } from './github.strategy';
import { TwoFAService } from './two-fa.service';
import { TwoFaGuard } from './twofa.guard';


@Module({
  imports:[
    ConfigModule.forRoot({
          isGlobal:true,
          envFilePath:'.env'
        }),
    UsersModule,
    JwtModule.registerAsync({
      imports:[ConfigModule],
      useFactory: async (config:ConfigService) => ({
        secret:config.get<string>('JWT_SECRET'),
        signOptions:{expiresIn:'1h'}
      }),
      inject:[ConfigService]
      })
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, GithubStrategy, TwoFAService,TwoFaGuard],
  controllers: [AuthController]
})
export class AuthModule {}