import { Module } from '@nestjs/common';
import { PomodoroSessionService } from './pomodoro-session.service';
import { PomodoroSessionController } from './pomodoro-session.controller';

@Module({
  providers: [PomodoroSessionService],
  controllers: [PomodoroSessionController]
})
export class PomodoroSessionModule {}
