import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  message?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}