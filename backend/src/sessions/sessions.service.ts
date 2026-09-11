import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { RescheduleSessionDto } from './dto/reschedule-session.dto';
import { combineDateAndTime, startOfToday } from '../common/date-time.util';

function timeStringToDate(time: string): Date {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

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
        status: { in: ['SCHEDULED', 'RESCHEDULED'] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      include: { module: true },
    });
  }

  // NEW — the same overlap logic, but checking the lecturer instead of the room.
  // Fixes: a lecturer could previously be double-booked into two different rooms at once.
  private async findConflictingSessionForLecturer(
    lecturerId: number,
    sessionDate: Date,
    startTime: Date,
    endTime: Date,
    excludeSessionId?: number,
  ) {
    return this.prisma.session.findFirst({
      where: {
        lecturerId,
        sessionDate,
        id: excludeSessionId ? { not: excludeSessionId } : undefined,
        status: { in: ['SCHEDULED', 'RESCHEDULED'] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      include: { module: true, room: true },
    });
  }

  // NEW — refuses to let a session be created/rescheduled to start in the past.
  private assertNotInPast(sessionDate: Date, startTime: Date) {
    if (combineDateAndTime(sessionDate, startTime) < new Date()) {
      throw new ConflictException('Cannot schedule a session to start in the past.');
    }
  }

  // NEW — refuses to let a session that's already happened be edited/cancelled/reopened.
  private assertSessionNotAlreadyOccurred(sessionDate: Date, endTime: Date) {
    if (combineDateAndTime(sessionDate, endTime) < new Date()) {
      throw new ConflictException('This session has already occurred and can no longer be modified.');
    }
  }

  async create(dto: CreateSessionDto, createdByAdminId: number) {
    const sessionDate = new Date(dto.sessionDate);
    const startTime = timeStringToDate(dto.startTime);
    const endTime = timeStringToDate(dto.endTime);

    this.assertNotInPast(sessionDate, startTime);

    const roomConflict = await this.findConflictingSession(dto.roomId, sessionDate, startTime, endTime);
    if (roomConflict) {
      const cs = roomConflict.startTime.toISOString().substring(11, 16);
      const ce = roomConflict.endTime.toISOString().substring(11, 16);
      throw new ConflictException(`Room already has a session (${roomConflict.module.code}) from ${cs} to ${ce} on this date that overlaps with the requested time.`);
    }

    const lecturerConflict = await this.findConflictingSessionForLecturer(dto.lecturerId, sessionDate, startTime, endTime);
    if (lecturerConflict) {
      const cs = lecturerConflict.startTime.toISOString().substring(11, 16);
      const ce = lecturerConflict.endTime.toISOString().substring(11, 16);
      throw new ConflictException(`This lecturer already has a session (${lecturerConflict.module.code} in ${lecturerConflict.room.code}) from ${cs} to ${ce} on this date that overlaps with the requested time.`);
    }

    return this.prisma.session.create({
      data: { roomId: dto.roomId, moduleId: dto.moduleId, lecturerId: dto.lecturerId, createdByAdminId, sessionDate, startTime, endTime, status: 'SCHEDULED' },
      include: { room: true, module: true, lecturer: true },
    });
  }

  async findAll(filters: {
    roomId?: number; status?: string; date?: string; timeFrom?: string; timeTo?: string;
    buildingId?: number; floorId?: number; sideId?: number; moduleId?: number; lecturerId?: number;
  }) {
    const sessions = await this.prisma.session.findMany({
      where: {
        roomId: filters.roomId,
        moduleId: filters.moduleId,
        lecturerId: filters.lecturerId,
        sessionDate: filters.date ? new Date(filters.date) : undefined,
        status: filters.status ? (filters.status as any) : { notIn: ['SUPERSEDED', 'COMPLETED'] },
        startTime: filters.timeFrom ? { gte: timeStringToDate(filters.timeFrom) } : undefined,
        endTime: filters.timeTo ? { lte: timeStringToDate(filters.timeTo) } : undefined,
        room: (filters.buildingId || filters.floorId || filters.sideId)
          ? { side: { id: filters.sideId, floor: { id: filters.floorId, buildingId: filters.buildingId } } }
          : undefined,
      },
      include: { room: { include: { side: { include: { floor: { include: { building: true } } } } } }, module: true, lecturer: true },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }],
    });

    if (!filters.status) {
      const now = new Date();
      return sessions.filter((s) => {
        if (s.status !== 'CANCELLED') return true;
        return combineDateAndTime(s.sessionDate, s.endTime) >= now;
      });
    }
    return sessions;
  }

  async findOne(id: number) {
    const session = await this.prisma.session.findUnique({ where: { id }, include: { room: true, module: true, lecturer: true } });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async update(id: number, dto: UpdateSessionDto) {
    const session = await this.findOne(id);
    if (session.status !== 'SCHEDULED' && session.status !== 'RESCHEDULED') {
      throw new ConflictException(`Only Scheduled or Rescheduled sessions can be edited (this one is ${session.status}).`);
    }
    this.assertSessionNotAlreadyOccurred(session.sessionDate, session.endTime);

    const newRoomId = dto.roomId ?? session.roomId;
    const newLecturerId = dto.lecturerId ?? session.lecturerId;

    if (newRoomId !== session.roomId) {
      const conflict = await this.findConflictingSession(newRoomId, session.sessionDate, session.startTime, session.endTime, id);
      if (conflict) {
        const cs = conflict.startTime.toISOString().substring(11, 16);
        const ce = conflict.endTime.toISOString().substring(11, 16);
        throw new ConflictException(`Cannot move to that room — it already has a session (${conflict.module.code}) from ${cs} to ${ce} at this session's time.`);
      }
    }

    // NEW — this is what was missing: Edit could silently create a lecturer double-booking.
    if (newLecturerId !== session.lecturerId) {
      const conflict = await this.findConflictingSessionForLecturer(newLecturerId, session.sessionDate, session.startTime, session.endTime, id);
      if (conflict) {
        const cs = conflict.startTime.toISOString().substring(11, 16);
        const ce = conflict.endTime.toISOString().substring(11, 16);
        throw new ConflictException(`This lecturer already has a session (${conflict.module.code} in ${conflict.room.code}) from ${cs} to ${ce} at this session's time.`);
      }
    }

    return this.prisma.session.update({ where: { id }, data: dto, include: { room: true, module: true, lecturer: true } });
  }

  async cancel(id: number, reason?: string) {
    const session = await this.findOne(id);
    if (session.status !== 'SCHEDULED' && session.status !== 'RESCHEDULED') {
      throw new ConflictException(`Only Scheduled or Rescheduled sessions can be cancelled (this one is ${session.status}).`);
    }
    this.assertSessionNotAlreadyOccurred(session.sessionDate, session.endTime);

    return this.prisma.session.update({ where: { id }, data: { status: 'CANCELLED', cancellationReason: reason }, include: { room: true, module: true, lecturer: true } });
  }

  async reopen(id: number) {
    const session = await this.findOne(id);
    if (session.status !== 'CANCELLED') {
      throw new ConflictException(`Only Cancelled sessions can be reopened (this one is ${session.status}).`);
    }
    // NEW — a cancelled session whose time has already passed can no longer be un-cancelled.
    this.assertSessionNotAlreadyOccurred(session.sessionDate, session.endTime);

    const roomConflict = await this.findConflictingSession(session.roomId, session.sessionDate, session.startTime, session.endTime, id);
    if (roomConflict) {
      const cs = roomConflict.startTime.toISOString().substring(11, 16);
      const ce = roomConflict.endTime.toISOString().substring(11, 16);
      throw new ConflictException(`Cannot reopen — another session (${roomConflict.module.code}) was booked into this room from ${cs} to ${ce} after this one was cancelled.`);
    }
    const lecturerConflict = await this.findConflictingSessionForLecturer(session.lecturerId, session.sessionDate, session.startTime, session.endTime, id);
    if (lecturerConflict) {
      const cs = lecturerConflict.startTime.toISOString().substring(11, 16);
      const ce = lecturerConflict.endTime.toISOString().substring(11, 16);
      throw new ConflictException(`Cannot reopen — this lecturer now has another session (${lecturerConflict.module.code} in ${lecturerConflict.room.code}) from ${cs} to ${ce} after this one was cancelled.`);
    }

    return this.prisma.session.update({ where: { id }, data: { status: 'SCHEDULED', cancellationReason: null }, include: { room: true, module: true, lecturer: true } });
  }

  async reschedule(id: number, dto: RescheduleSessionDto, createdByAdminId: number) {
    const original = await this.findOne(id);
    if (original.status !== 'SCHEDULED' && original.status !== 'RESCHEDULED') {
      throw new ConflictException(`Only Scheduled or Rescheduled sessions can be rescheduled (this one is ${original.status}).`);
    }
    this.assertSessionNotAlreadyOccurred(original.sessionDate, original.endTime);

    const newRoomId = dto.roomId ?? original.roomId;
    const newSessionDate = new Date(dto.sessionDate);
    const newStartTime = timeStringToDate(dto.startTime);
    const newEndTime = timeStringToDate(dto.endTime);

    // NEW — can't reschedule something TO a time in the past.
    this.assertNotInPast(newSessionDate, newStartTime);

    const roomConflict = await this.findConflictingSession(newRoomId, newSessionDate, newStartTime, newEndTime, id);
    if (roomConflict) {
      const cs = roomConflict.startTime.toISOString().substring(11, 16);
      const ce = roomConflict.endTime.toISOString().substring(11, 16);
      throw new ConflictException(`Cannot reschedule — room already has a session (${roomConflict.module.code}) from ${cs} to ${ce} on that date.`);
    }
    // NEW — the lecturer's OTHER sessions must also not conflict with the new slot.
    const lecturerConflict = await this.findConflictingSessionForLecturer(original.lecturerId, newSessionDate, newStartTime, newEndTime, id);
    if (lecturerConflict) {
      const cs = lecturerConflict.startTime.toISOString().substring(11, 16);
      const ce = lecturerConflict.endTime.toISOString().substring(11, 16);
      throw new ConflictException(`Cannot reschedule — this lecturer already has a session (${lecturerConflict.module.code} in ${lecturerConflict.room.code}) from ${cs} to ${ce} on that date.`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.session.update({ where: { id }, data: { status: 'SUPERSEDED' } });
      return tx.session.create({
        data: { roomId: newRoomId, moduleId: original.moduleId, lecturerId: original.lecturerId, createdByAdminId, originalSessionId: id, sessionDate: newSessionDate, startTime: newStartTime, endTime: newEndTime, status: 'RESCHEDULED', rescheduleReason: dto.reason },
        include: { room: true, module: true, lecturer: true },
      });
    });
  }

  async getHistory(id: number) {
    const chain = [];
    let current = await this.findOne(id);
    chain.unshift(current);
    while (current.originalSessionId) {
      current = await this.findOne(current.originalSessionId);
      chain.unshift(current);
    }
    return chain;
  }

  // NEW — real fix for #02: runs every 5 minutes, transitions any Scheduled/Rescheduled
  // session whose end time has passed into Completed.
  @Cron(CronExpression.EVERY_5_MINUTES)
  async markPastSessionsCompleted() {
    const candidates = await this.prisma.session.findMany({
      where: { status: { in: ['SCHEDULED', 'RESCHEDULED'] }, sessionDate: { lte: startOfToday() } },
    });
    const now = new Date();
    const idsToComplete = candidates.filter((s) => combineDateAndTime(s.sessionDate, s.endTime) < now).map((s) => s.id);
    if (idsToComplete.length > 0) {
      await this.prisma.session.updateMany({ where: { id: { in: idsToComplete } }, data: { status: 'COMPLETED' } });
    }
  }
}