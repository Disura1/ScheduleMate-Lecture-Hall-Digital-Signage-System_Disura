import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';

@Injectable()
export class AcademicService {
  constructor(private prisma: PrismaService) {}

  // ---- Modules ----

  getModules() {
    return this.prisma.module.findMany({
      include: { _count: { select: { sessions: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async createModule(dto: CreateModuleDto) {
    const existing = await this.prisma.module.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Module code "${dto.code}" already exists`);
    }
    return this.prisma.module.create({ data: dto });
  }

  async updateModule(id: number, dto: UpdateModuleDto) {
    await this.findModuleOrThrow(id);
    return this.prisma.module.update({ where: { id }, data: dto });
  }

  async deleteModule(id: number) {
    await this.findModuleOrThrow(id);
    const sessionCount = await this.prisma.session.count({ where: { moduleId: id } });
    if (sessionCount > 0) {
      throw new ConflictException(
        `This module has ${sessionCount} session(s) referencing it and cannot be deleted until they are reassigned or removed.`,
      );
    }
    return this.prisma.module.delete({ where: { id } });
  }

  private async findModuleOrThrow(id: number) {
    const module = await this.prisma.module.findUnique({ where: { id } });
    if (!module) throw new NotFoundException(`Module ${id} not found`);
    return module;
  }

  // ---- Lecturers ----

  getLecturers() {
    return this.prisma.lecturer.findMany({
      include: { _count: { select: { sessions: true } } },
      orderBy: { name: 'asc' },
    });
  }

  createLecturer(dto: CreateLecturerDto) {
    return this.prisma.lecturer.create({ data: dto });
  }

  async updateLecturer(id: number, dto: UpdateLecturerDto) {
    await this.findLecturerOrThrow(id);
    return this.prisma.lecturer.update({ where: { id }, data: dto });
  }

  async deleteLecturer(id: number) {
    await this.findLecturerOrThrow(id);
    const sessionCount = await this.prisma.session.count({ where: { lecturerId: id } });
    if (sessionCount > 0) {
      throw new ConflictException(
        `This lecturer has ${sessionCount} session(s) assigned and cannot be deleted until they are reassigned or removed.`,
      );
    }
    return this.prisma.lecturer.delete({ where: { id } });
  }

  private async findLecturerOrThrow(id: number) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { id } });
    if (!lecturer) throw new NotFoundException(`Lecturer ${id} not found`);
    return lecturer;
  }
}