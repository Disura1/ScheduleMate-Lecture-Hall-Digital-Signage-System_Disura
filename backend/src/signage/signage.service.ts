import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DisplayService } from '../display/display.service';

function startOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Our startTime/endTime are stored as @db.Time (date part is irrelevant, always 1970-01-01) —
// this builds a comparable value using today's date + that stored time-of-day.
function combineDateAndTime(date: Date, time: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), time.getUTCHours(), time.getUTCMinutes()),
  );
}

@Injectable()
export class SignageService {
  constructor(
    private prisma: PrismaService,
    private displayService: DisplayService,
  ) {}

  async getSlideData(deviceIdentifier: string) {
    const display = await this.prisma.display.findUnique({
      where: { deviceIdentifier },
      include: { side: { include: { floor: { include: { building: true } } } } },
    });
    if (!display) {
      throw new NotFoundException(`Unknown display: ${deviceIdentifier}`);
    }

    // Every successful poll updates "Last Seen" (Addendum 2's Displays table)
    await this.displayService.recordHeartbeat(deviceIdentifier);

    const rooms = await this.prisma.room.findMany({ where: { sideId: display.sideId } });
    const roomIds = rooms.map((r) => r.id);

    const today = startOfToday();
    const now = new Date();

    const todaySessions = await this.prisma.session.findMany({
      where: {
        roomId: { in: roomIds },
        sessionDate: today,
        status: { in: ['SCHEDULED', 'RESCHEDULED'] },
      },
      include: { room: true, module: true, lecturer: true },
      orderBy: { startTime: 'asc' },
    });

    const ongoing = todaySessions.filter((s) => {
      const start = combineDateAndTime(today, s.startTime);
      const end = combineDateAndTime(today, s.endTime);
      return start <= now && now < end;
    });

    const upcoming = todaySessions.filter((s) => {
      const start = combineDateAndTime(today, s.startTime);
      return start > now;
    });

    return {
      location: {
        building: display.side.floor.building.name,
        floor: display.side.floor.floorNumber,
        side: display.side.sideCode,
      },
      currentTime: now.toISOString(),
      ongoing,
      upcoming,
    };
  }
}