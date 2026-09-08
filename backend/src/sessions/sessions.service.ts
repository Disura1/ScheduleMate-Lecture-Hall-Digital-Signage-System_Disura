import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { RescheduleSessionDto } from './dto/reschedule-session.dto';

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

  async cancel(id: number, reason?: string) {
    const session = await this.findOne(id);
    if (session.status !== 'SCHEDULED' && session.status !== 'RESCHEDULED') {
      throw new ConflictException(`Only Scheduled or Rescheduled sessions can be cancelled (this one is ${session.status}).`);
    }

    return this.prisma.session.update({
      where: { id },
      data: { status: 'CANCELLED', cancellationReason: reason },
      include: { room: true, module: true, lecturer: true },
    });
  }

  async reopen(id: number) {
    const session = await this.findOne(id);
    if (session.status !== 'CANCELLED') {
      throw new ConflictException(`Only Cancelled sessions can be reopened (this one is ${session.status}).`);
    }

    const conflict = await this.findConflictingSession(session.roomId, session.sessionDate, session.startTime, session.endTime, id);
    if (conflict) {
      const conflictStart = conflict.startTime.toISOString().substring(11, 16);
      const conflictEnd = conflict.endTime.toISOString().substring(11, 16);
      throw new ConflictException(
        `Cannot reopen — another session (${conflict.module.code}) was booked into this room from ${conflictStart} to ${conflictEnd} after this one was cancelled.`,
      );
    }

    return this.prisma.session.update({
      where: { id },
      data: { status: 'SCHEDULED', cancellationReason: null },
      include: { room: true, module: true, lecturer: true },
    });
  }

  async reschedule(id: number, dto: RescheduleSessionDto, createdByAdminId: number) {
    const original = await this.findOne(id);
    if (original.status !== 'SCHEDULED' && original.status !== 'RESCHEDULED') {
      throw new ConflictException(`Only Scheduled or Rescheduled sessions can be rescheduled (this one is ${original.status}).`);
    }

    const newRoomId = dto.roomId ?? original.roomId;
    const newSessionDate = new Date(dto.sessionDate);
    const newStartTime = timeStringToDate(dto.startTime);
    const newEndTime = timeStringToDate(dto.endTime);

    // Exclude the original — it's about to be superseded, so it shouldn't block its own replacement
    const conflict = await this.findConflictingSession(newRoomId, newSessionDate, newStartTime, newEndTime, id);
    if (conflict) {
      const conflictStart = conflict.startTime.toISOString().substring(11, 16);
      const conflictEnd = conflict.endTime.toISOString().substring(11, 16);
      throw new ConflictException(
        `Cannot reschedule — room already has a session (${conflict.module.code}) from ${conflictStart} to ${conflictEnd} on that date.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id },
        data: { status: 'SUPERSEDED' },
      });

      return tx.session.create({
        data: {
          roomId: newRoomId,
          moduleId: original.moduleId,
          lecturerId: original.lecturerId,
          createdByAdminId,
          originalSessionId: id,
          sessionDate: newSessionDate,
          startTime: newStartTime,
          endTime: newEndTime,
          status: 'RESCHEDULED',
          rescheduleReason: dto.reason,
        },
        include: { room: true, module: true, lecturer: true },
      });
    });
  }

  async getHistory(id: number) {
    const chain = [];
    let current = await this.findOne(id);
    chain.unshift(current);

    // Walk backward through originalSessionId until we reach the very first booking
    while (current.originalSessionId) {
      current = await this.findOne(current.originalSessionId);
      chain.unshift(current);
    }

    return chain;
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