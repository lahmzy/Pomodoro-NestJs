import { Module } from '@nestjs/common';
import { PomodoroSessionService } from './pomodoro-session.service';
import { PomodoroSessionController } from './pomodoro-session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PomodoroSession } from './pomodoro-session';

@Module({
  imports: [TypeOrmModule.forFeature([PomodoroSession])],
  providers: [PomodoroSessionService],
  controllers: [PomodoroSessionController],
})
export class PomodoroSessionModule {}
