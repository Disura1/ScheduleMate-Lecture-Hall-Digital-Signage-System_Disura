import { IsInt, IsDateString, Matches } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/; // 24-hour HH:mm

export class CreateSessionDto {
  @IsInt()
  roomId: number;

  @IsInt()
  moduleId: number;

  @IsInt()
  lecturerId: number;

  @IsDateString()
  sessionDate: string; // e.g. "2026-09-10"

  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:mm 24-hour format, e.g. 17:00' })
  startTime: string;

  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:mm 24-hour format, e.g. 20:00' })
  endTime: string;
}