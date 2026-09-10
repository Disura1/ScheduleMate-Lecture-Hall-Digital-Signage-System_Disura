import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async login(usernameOrEmail: string, password: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] },
    });

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

  async forgotPassword(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });

    // Only proceed if the account exists AND is active — but we never let the caller
    // know either way, to avoid leaking which emails are registered admins.
    if (admin && admin.status === 'ACTIVE') {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

      await this.prisma.admin.update({
        where: { id: admin.id },
        data: { resetToken, resetTokenExpiresAt },
      });

      const resetLink = `${process.env.FRONTEND_ADMIN_URL}/reset-password?token=${resetToken}`;
      await this.emailService.sendPasswordResetEmail(admin.email, admin.fullName, resetLink);
    }

    // Always the same response, regardless of what happened above
    return { message: 'If that email is registered, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const admin = await this.prisma.admin.findUnique({ where: { resetToken: token } });
    if (!admin) {
      throw new UnauthorizedException('Invalid or already-used reset link');
    }
    if (!admin.resetTokenExpiresAt || admin.resetTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('This reset link has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
    });

    return { message: 'Password reset successfully' };
  }
}