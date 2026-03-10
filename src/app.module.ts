import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PomodoroSessionModule } from './pomodoro-session/pomodoro-session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => {
    const databaseUrl = config.get<string>('DATABASE_URL');

    return {
      type: 'postgres',
      // If DATABASE_URL exists (Production), use it. Otherwise, use individual pieces (Local).
      url: databaseUrl, 
      host: !databaseUrl ? config.get<string>('DB_HOST') : undefined,
      port: !databaseUrl ? config.get<number>('DB_PORT') ?? 5432 : undefined,
      username: !databaseUrl ? config.get<string>('DB_USERNAME') : undefined,
      password: !databaseUrl ? config.get<string>('DB_PASSWORD') : undefined,
      database: !databaseUrl ? config.get<string>('DB_NAME') : undefined,

      autoLoadEntities: true,
      synchronize: true, // This will create the tables on Supabase for you
      
      // CRITICAL: Supabase requires SSL in production
      ssl: databaseUrl ? { rejectUnauthorized: false } : false,
      
      // Extra config for Supabase Connection Pooler
      extra: databaseUrl ? {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      } : {},
    };
  },
  inject: [ConfigService],
}),
    AuthModule,
    UsersModule,
    PomodoroSessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}