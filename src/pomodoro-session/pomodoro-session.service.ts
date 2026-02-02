import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StartSessionDTO } from './dto/start-session.dto';
import { PomodoroSession } from './pomodoro-session';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

const SESSION_DURATIONS = {
  pomodoro: 25 * 60, // 25 mins
  short_break: 5 * 60, // 5 mins
  long_break: 15 * 60, // 15 mins
};

@Injectable()
export class PomodoroSessionService {
  constructor(
    @InjectRepository(PomodoroSession)
    private readonly sessionRepo: Repository<PomodoroSession>,
  ) {}
  async start(dto: StartSessionDTO, userId: number): Promise<PomodoroSession> {
    try {
      const activeSession = await this.sessionRepo.findOne({
        where: { userId, endTime: IsNull() },
        order: { startTime: 'DESC' },
      });

      if (activeSession) {
        const now = new Date();
        activeSession.endTime = now;
        activeSession.duration = Math.floor(
          (+now - +activeSession.startTime) / 1000,
        );
        return await this.sessionRepo.save(activeSession);
      }

      const expectedDuration = SESSION_DURATIONS[dto.type];

      const session = this.sessionRepo.create({
        userId,
        type: dto.type,
        startTime: new Date(),
        taskId: dto.taskId !== undefined ? dto.taskId : undefined,
        expectedDuration,
      });
      return this.sessionRepo.save(session);
    } catch (error) {
      console.error('Error starting session:', error);
      throw new InternalServerErrorException('Could not start session', error);
    }
  }

  async end(sessionId: number, userId: number): Promise<PomodoroSession> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.endTime) {
      throw new ForbiddenException('Session already ended');
    }
    const endTime = new Date();
    session.endTime = endTime;
    session.duration = Math.floor((+endTime - +session.startTime) / 1000);
    return this.sessionRepo.save(session);
  }

  async getCurrentSession(id: number) {
    const session = await this.sessionRepo.findOne({
      where: { userId: id, endTime: IsNull() },
      order: { startTime: 'DESC' },
    });

    if (!session) {
      throw new NotFoundException('No active session found');
    }
    return session;
  }
}