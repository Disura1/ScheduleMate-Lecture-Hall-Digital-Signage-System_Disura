import { IsEnum, IsInt, Matches } from 'class-validator';
import { RoomType } from '@prisma/client';

// Enforces the documented naming convention (FR-06), e.g. M-05A-L01, M-03A-LAB1, N-14G-LH1
const ROOM_CODE_PATTERN = /^(M|N)-\d{2}[A-Z]-(L\d{2}|LAB\d+|LH\d+)$/;

export class CreateRoomDto {
  @IsInt()
  sideId: number;

  @Matches(ROOM_CODE_PATTERN, {
    message: 'Room code must follow the format <M|N>-<Floor><Side>-<L##|LAB#|LH#>, e.g. M-05A-L01',
  })
  code: string;

  @IsEnum(RoomType)
  type: RoomType;
}