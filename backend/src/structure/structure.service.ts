import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { startOfToday, combineDateAndTime } from '../common/date-time.util';

@Injectable()
export class StructureService {
  constructor(private prisma: PrismaService) {}

  // ---- Read-only: fixed campus structure (for populating dropdowns) ----

  getBuildings() {
    return this.prisma.building.findMany({
      include: { floors: { include: { sides: true } } },
    });
  }

  getFloors(buildingId: number) {
    return this.prisma.floor.findMany({
      where: { buildingId },
      include: { sides: true },
      orderBy: { floorNumber: 'asc' },
    });
  }

  getSides(floorId: number) {
    return this.prisma.side.findMany({ where: { floorId } });
  }

  // ---- Rooms: full CRUD ----

  getRooms(filters: { buildingId?: number; floorId?: number; sideId?: number }) {
    return this.prisma.room.findMany({
      where: {
        side: {
          id: filters.sideId,
          floor: {
            id: filters.floorId,
            buildingId: filters.buildingId,
          },
        },
      },
      include: { side: { include: { floor: { include: { building: true } } } } },
    });
  }

  async createRoom(dto: CreateRoomDto) {
    const existing = await this.prisma.room.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Room code "${dto.code}" already exists`);
    }
    return this.prisma.room.create({ data: dto });
  }

  async updateRoom(id: number, dto: UpdateRoomDto) {
    await this.findRoomOrThrow(id);
    return this.prisma.room.update({ where: { id }, data: dto });
  }

  async deleteRoom(id: number) {
    await this.findRoomOrThrow(id);

    const sessionCount = await this.prisma.session.count({ where: { roomId: id } });
    if (sessionCount > 0) {
      throw new ConflictException(
        `This room has ${sessionCount} session(s) referencing it and cannot be deleted until they are reassigned or removed.`,
      );
    }

    return this.prisma.room.delete({ where: { id } });
  }

  private async findRoomOrThrow(id: number) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Room ${id} not found`);
    }
    return room;
  }

  async getRoomStatus(filters: { buildingId?: number; floorId?: number; sideId?: number; search?: string; status?: string }) {
    const rooms = await this.prisma.room.findMany({
      where: {
        side: {
          id: filters.sideId,
          floor: {
            id: filters.floorId,
            buildingId: filters.buildingId,
          },
        },
      },
      include: { side: { include: { floor: { include: { building: true } } } } },
    });

    const today = startOfToday();
    const now = new Date();
    const UPCOMING_SOON_WINDOW_MINUTES = 30;

    const results = await Promise.all(
      rooms.map(async (room) => {
        const todaySessions = await this.prisma.session.findMany({
          where: { roomId: room.id, sessionDate: today, status: { in: ['SCHEDULED', 'RESCHEDULED', 'CANCELLED'] } },
          include: { module: true, lecturer: true },
        });

        const ongoing = todaySessions.find((s) => {
          if (s.status === 'CANCELLED') return false;
          const start = combineDateAndTime(today, s.startTime);
          const end = combineDateAndTime(today, s.endTime);
          return start <= now && now < end;
        });

        const cancelledNow = todaySessions.find((s) => {
          if (s.status !== 'CANCELLED') return false;
          const start = combineDateAndTime(today, s.startTime);
          const end = combineDateAndTime(today, s.endTime);
          return start <= now && now < end;
        });

        const upcomingSoon = todaySessions.find((s) => {
          if (s.status === 'CANCELLED') return false;
          const start = combineDateAndTime(today, s.startTime);
          const minutesUntilStart = (start.getTime() - now.getTime()) / 60000;
          return minutesUntilStart > 0 && minutesUntilStart <= UPCOMING_SOON_WINDOW_MINUTES;
        });

        let status: string;
        let currentSession: (typeof todaySessions)[number] | undefined;

        if (ongoing) {
          status = 'ONGOING_NOW';
          currentSession = ongoing;
        } else if (cancelledNow) {
          status = 'TEMPORARILY_UNAVAILABLE';
          currentSession = cancelledNow;
        } else if (upcomingSoon) {
          status = 'UPCOMING_SOON';
          currentSession = upcomingSoon;
        } else {
          status = 'AVAILABLE';
        }

        return {
          room,
          status,
          currentSession: currentSession
            ? { module: currentSession.module, lecturer: currentSession.lecturer, status: currentSession.status }
            : null,
        };
      }),
    );

    let filtered = results;

    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.currentSession?.module.code.toLowerCase().includes(term) ||
          r.currentSession?.module.name.toLowerCase().includes(term) ||
          r.currentSession?.lecturer.name.toLowerCase().includes(term),
      );
    }

    return filtered;
  }
}