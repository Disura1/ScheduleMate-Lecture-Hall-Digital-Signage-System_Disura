import { IsInt, IsOptional, IsDateString, IsString, Matches } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class RescheduleSessionDto {
  @IsOptional()
  @IsInt()
  roomId?: number; // optional — defaults to the same room if not provided

  @IsDateString()
  sessionDate: string;

  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:mm 24-hour format' })
  startTime: string;

  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:mm 24-hour format' })
  endTime: string;

  @IsOptional()
  @IsString()
  reason?: string;
}