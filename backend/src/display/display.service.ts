import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisplayDto } from './dto/create-display.dto';
import { ReassignDisplayDto } from './dto/reassign-display.dto';

@Injectable()
export class DisplayService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.display.findMany({
      include: { side: { include: { floor: { include: { building: true } } } } },
      orderBy: { deviceIdentifier: 'asc' },
    });
  }

  async register(dto: CreateDisplayDto) {
    const existing = await this.prisma.display.findUnique({ where: { deviceIdentifier: dto.deviceIdentifier } });
    if (existing) {
      throw new ConflictException(`Device "${dto.deviceIdentifier}" is already registered`);
    }
    return this.prisma.display.create({
      data: dto,
      include: { side: { include: { floor: { include: { building: true } } } } },
    });
  }

  async reassign(id: number, dto: ReassignDisplayDto) {
    await this.findOrThrow(id);
    return this.prisma.display.update({
      where: { id },
      data: { sideId: dto.sideId },
      include: { side: { include: { floor: { include: { building: true } } } } },
    });
  }

  async remove(id: number) {
    await this.findOrThrow(id);
    return this.prisma.display.delete({ where: { id } });
  }

  // Called by the signage client on every poll — powers the "Last Seen" column (Addendum 2)
  async recordHeartbeat(deviceIdentifier: string) {
    const display = await this.prisma.display.findUnique({ where: { deviceIdentifier } });
    if (!display) {
      throw new NotFoundException(`Unknown display: ${deviceIdentifier}`);
    }
    return this.prisma.display.update({
      where: { id: display.id },
      data: { lastSeenAt: new Date() },
    });
  }

  private async findOrThrow(id: number) {
    const display = await this.prisma.display.findUnique({ where: { id } });
    if (!display) throw new NotFoundException(`Display ${id} not found`);
    return display;
  }
}