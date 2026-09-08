import { IsString, MinLength } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @MinLength(2)
  code: string; // e.g. "IT1130"

  @IsString()
  @MinLength(2)
  name: string;
}