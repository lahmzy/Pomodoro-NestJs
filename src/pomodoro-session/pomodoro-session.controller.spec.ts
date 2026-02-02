import { Test, TestingModule } from '@nestjs/testing';
import { PomodoroSessionController } from './pomodoro-session.controller';

describe('PomodoroSessionController', () => {
  let controller: PomodoroSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PomodoroSessionController],
    }).compile();

    controller = module.get<PomodoroSessionController>(PomodoroSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
