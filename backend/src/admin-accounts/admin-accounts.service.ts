import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

const ACTIVATION_WINDOW_HOURS = 24;

@Injectable()
export class AdminAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdminDto) {
    const existingUsername = await this.prisma.admin.findUnique({ where: { username: dto.username } });
    if (existingUsername) {
      throw new ConflictException(`Username "${dto.username}" is already taken`);
    }
    const existingEmail = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (existingEmail) {
      throw new ConflictException(`Email "${dto.email}" is already registered`);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + ACTIVATION_WINDOW_HOURS * 60 * 60 * 1000);

    const admin = await this.prisma.admin.create({
      data: {
        fullName: dto.fullName,
        username: dto.username,
        email: dto.email,
        role: dto.role,
        status: 'ACTIVE',
        resetToken,
        resetTokenExpiresAt,
      },
    });

    // NOTE: in a real deployment this token would be emailed, never returned in the API response.
    // For local dev/testing without an email service configured, we return it directly — this is a
    // deliberate, documented placeholder (see README), not a production security practice.
    return { admin, activationLink: `http://localhost:5173/activate?token=${resetToken}` };
  }

  async activate(token: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { resetToken: token } });
    if (!admin) {
      throw new BadRequestException('Invalid or already-used activation link');
    }
    if (!admin.resetTokenExpiresAt || admin.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException('This activation link has expired');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
    });
  }

  async deactivate(targetId: number, actingAdminId: number) {
    if (targetId === actingAdminId) {
      throw new ConflictException('You cannot deactivate your own account.');
    }

    const target = await this.findOrThrow(targetId);
    if (target.status === 'DEACTIVATED') {
      throw new ConflictException('This account is already deactivated.');
    }

    return this.prisma.admin.update({
      where: { id: targetId },
      data: { status: 'DEACTIVATED' },
      select: { id: true, fullName: true, username: true, email: true, role: true, status: true, createdAt: true },
    });
  }

  async reactivate(targetId: number) {
    const target = await this.findOrThrow(targetId);
    if (target.status === 'ACTIVE') {
      throw new ConflictException('This account is already active.');
    }

    return this.prisma.admin.update({
      where: { id: targetId },
      data: { status: 'ACTIVE' },
      select: { id: true, fullName: true, username: true, email: true, role: true, status: true, createdAt: true },
    });
  }

  private async findOrThrow(id: number) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException(`Admin ${id} not found`);
    return admin;
  }

  findAll() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        // passwordHash, resetToken deliberately excluded — never sent to the client
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async updateProfile(targetId: number, dto: UpdateAdminDto) {
    await this.findOrThrow(targetId);

    if (dto.email) {
      const existing = await this.prisma.admin.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== targetId) {
        throw new ConflictException(`Email "${dto.email}" is already registered to another account`);
      }
    }

    return this.prisma.admin.update({
      where: { id: targetId },
      data: dto,
      select: { id: true, fullName: true, username: true, email: true, role: true, status: true, createdAt: true },
    });
  }

  async updateRole(targetId: number, role: 'ADMIN' | 'SUPER_ADMIN', actingAdminId: number) {
    if (targetId === actingAdminId) {
      throw new ConflictException('You cannot change your own role.');
    }
    await this.findOrThrow(targetId);

    return this.prisma.admin.update({
      where: { id: targetId },
      data: { role },
      select: { id: true, fullName: true, username: true, email: true, role: true, status: true, createdAt: true },
    });
  }
}