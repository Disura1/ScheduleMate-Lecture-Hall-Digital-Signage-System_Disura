import { IsInt } from 'class-validator';

export class ReassignDisplayDto {
  @IsInt()
  sideId: number;
}