import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DisplayService } from '../display/display.service';
import { startOfToday, combineDateAndTime } from '../common/date-time.util';

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

    await this.displayService.recordHeartbeat(deviceIdentifier);

    const rooms = await this.prisma.room.findMany({ where: { sideId: display.sideId } });
    const roomIds = rooms.map((r) => r.id);

    const today = startOfToday();
    const now = new Date();

    const activeToday = await this.prisma.session.findMany({
      where: {
        roomId: { in: roomIds },
        sessionDate: today,
        status: { in: ['SCHEDULED', 'RESCHEDULED'] },
      },
      include: { room: true, module: true, lecturer: true },
      orderBy: { startTime: 'asc' },
    });

    const ongoing = activeToday.filter((s) => {
      const start = combineDateAndTime(today, s.startTime);
      const end = combineDateAndTime(today, s.endTime);
      return start <= now && now < end;
    });

    const upcoming = activeToday.filter((s) => {
      const start = combineDateAndTime(today, s.startTime);
      return start > now;
    });

    // Cancelled: sessions that WERE scheduled for today in this side's rooms, now Cancelled
    const cancelled = await this.prisma.session.findMany({
      where: {
        roomId: { in: roomIds },
        sessionDate: today,
        status: 'CANCELLED',
      },
      include: { room: true, module: true, lecturer: true },
      orderBy: { startTime: 'asc' },
    });

    // Rescheduled: the NEW version's sessionDate is today — i.e. it landed on today's schedule via a reschedule
    const rescheduled = await this.prisma.session.findMany({
      where: {
        roomId: { in: roomIds },
        sessionDate: today,
        status: 'RESCHEDULED',
        originalSessionId: { not: null },
      },
      include: { room: true, module: true, lecturer: true, originalSession: true },
      orderBy: { startTime: 'asc' },
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
      cancelled,
      rescheduled,
    };
  }
}