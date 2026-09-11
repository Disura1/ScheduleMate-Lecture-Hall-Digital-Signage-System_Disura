import { IsInt, IsString, MinLength, IsOptional, Min, Max } from 'class-validator';

export class CreateDisplayDto {
  @IsString()
  @MinLength(3)
  deviceIdentifier: string;

  @IsInt()
  sideId: number;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(60)
  slideDurationSeconds?: number;
}