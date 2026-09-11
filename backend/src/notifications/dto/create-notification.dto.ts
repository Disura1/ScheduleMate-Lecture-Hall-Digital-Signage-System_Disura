import { IsString, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @MinLength(2)
  message: string;
}