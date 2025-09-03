import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';


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
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}