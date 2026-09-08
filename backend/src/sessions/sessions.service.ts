import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.prisma.session.create({
      data: {
        roomId: dto.roomId,
        moduleId: dto.moduleId,
        lecturerId: dto.lecturerId,
        createdByAdminId,
        sessionDate: new Date(dto.sessionDate),
        startTime: timeStringToDate(dto.startTime),
        endTime: timeStringToDate(dto.endTime),
        status: 'SCHEDULED',
      },
      include: { room: true, module: true, lecturer: true },
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