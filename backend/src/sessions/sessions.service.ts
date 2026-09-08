import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';

// Prisma's @db.Time fields expect a Date object; only the time-of-day portion is stored
function timeStringToDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSessionDto, createdByAdminId: number) {
    const sessionDate = new Date(dto.sessionDate);
    const startTime = timeStringToDate(dto.startTime);
    const endTime = timeStringToDate(dto.endTime);

    const conflict = await this.findConflictingSession(dto.roomId, sessionDate, startTime, endTime);
    if (conflict) {
      const conflictStart = conflict.startTime.toISOString().substring(11, 16);
      const conflictEnd = conflict.endTime.toISOString().substring(11, 16);
      throw new ConflictException(
        `Room already has a session (${conflict.module.code}) from ${conflictStart} to ${conflictEnd} on this date that overlaps with the requested time.`,
      );
    }

    return this.prisma.session.create({
      data: {
        roomId: dto.roomId,
        moduleId: dto.moduleId,
        lecturerId: dto.lecturerId,
        createdByAdminId,
        sessionDate,
        startTime,
        endTime,
        status: 'SCHEDULED',
      },
      include: { room: true, module: true, lecturer: true },
    });
  }

  private async findConflictingSession(
    roomId: number,
    sessionDate: Date,
    startTime: Date,
    endTime: Date,
    excludeSessionId?: number,
  ) {
    return this.prisma.session.findFirst({
      where: {
        roomId,
        sessionDate,
        id: excludeSessionId ? { not: excludeSessionId } : undefined,
        status: { in: ['SCHEDULED', 'RESCHEDULED'] }, // ignore Cancelled/Superseded/Completed — they don't hold the room
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      include: { module: true },
    });
  }

  findAll(filters: { roomId?: number; status?: string }) {
    return this.prisma.session.findMany({
      where: {
        roomId: filters.roomId,
        status: filters.status as any,
      },
      include: { room: true, module: true, lecturer: true },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: number) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { room: true, module: true, lecturer: true },
    });
    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }
    return session;
  }
}