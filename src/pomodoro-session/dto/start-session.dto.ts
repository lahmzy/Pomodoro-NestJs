import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { SessionType } from '../pomodoro-session';

export class StartSessionDTO {
  @IsEnum(SessionType)
  type: SessionType;

  @IsOptional()
  @IsInt()
  taskId?: number;
}