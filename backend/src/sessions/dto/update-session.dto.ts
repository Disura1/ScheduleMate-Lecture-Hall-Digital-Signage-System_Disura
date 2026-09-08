import { IsInt, IsOptional } from 'class-validator';

export class UpdateSessionDto {
  @IsOptional()
  @IsInt()
  roomId?: number;

  @IsOptional()
  @IsInt()
  moduleId?: number;

  @IsOptional()
  @IsInt()
  lecturerId?: number;
}