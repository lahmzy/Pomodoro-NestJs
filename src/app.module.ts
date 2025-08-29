import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:'.env'
    }),
    TypeOrmModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: async (config : ConfigService) => ({
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT') ?? 5432,
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
        
          // entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true, // set to false in production
          autoLoadEntities:true
        }),
        inject:[ConfigService]
      }
    ),
    AuthModule,
    UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
