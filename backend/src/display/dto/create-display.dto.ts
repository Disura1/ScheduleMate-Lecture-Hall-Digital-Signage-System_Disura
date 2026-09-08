import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateDisplayDto {
  @IsString()
  @MinLength(3)
  deviceIdentifier: string; // e.g. "DSP-0012"

  @IsInt()
  sideId: number;
}