import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (admin.status === 'DEACTIVATED') {
      throw new UnauthorizedException('This account has been deactivated');
    }

    if (!admin.passwordHash) {
      throw new UnauthorizedException('This account has not been activated yet. Check your email for the activation link.');
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { sub: admin.id, username: admin.username, role: admin.role };
    return {
      accessToken: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async changePassword(adminId: number, dto: ChangePasswordDto) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin || !admin.passwordHash) {
      throw new UnauthorizedException('Account not found or not yet activated');
    }

    const currentMatches = await bcrypt.compare(dto.currentPassword, admin.passwordHash);
    if (!currentMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.admin.update({ where: { id: adminId }, data: { passwordHash: newPasswordHash } });
    return { message: 'Password updated successfully' };
  }
}