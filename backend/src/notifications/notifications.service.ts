import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // Public — called by SignageModule, no auth
  getActiveMessages() {
    return this.prisma.notification.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, message: true },
    });
  }

  create(dto: CreateNotificationDto, createdByAdminId: number) {
    return this.prisma.notification.create({ data: { message: dto.message, createdByAdminId } });
  }

  async update(id: number, dto: UpdateNotificationDto) {
    await this.findOrThrow(id);
    return this.prisma.notification.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOrThrow(id);
    return this.prisma.notification.delete({ where: { id } });
  }

  private async findOrThrow(id: number) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException(`Notification ${id} not found`);
    return notification;
  }
}