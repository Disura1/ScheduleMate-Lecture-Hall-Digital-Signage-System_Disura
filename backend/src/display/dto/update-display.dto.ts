import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateDisplayDto {
  @IsOptional()
  @IsInt()
  sideId?: number;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(60)
  slideDurationSeconds?: number;
}