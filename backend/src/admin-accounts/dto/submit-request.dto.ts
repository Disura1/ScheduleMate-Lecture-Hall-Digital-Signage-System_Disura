import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitRequestDto {
  @IsString()
  @MinLength(2)
  requestedFullName: string;

  @IsEmail()
  requestedEmail: string;

  @IsOptional()
  @IsString()
  reason?: string;
}