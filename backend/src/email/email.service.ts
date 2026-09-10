import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.EMAIL_FROM ?? 'ScheduleMate <onboarding@resend.dev>';
  }

  async sendActivationEmail(to: string, fullName: string, activationLink: string, invitedBy: string) {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Welcome to ScheduleMate — Activate Your Account',
      html: `
        <p>Hi ${fullName},</p>
        <p>${invitedBy} has invited you as an admin on ScheduleMate. Click below to set your password and activate your account:</p>
        <p><a href="${activationLink}">Activate My Account</a></p>
        <p>This link expires in 24 hours.</p>
      `,
    });
    this.logger.log(`Activation email sent to ${to}`);
  }

  async sendPasswordResetEmail(to: string, fullName: string, resetLink: string) {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'ScheduleMate — Reset Your Password',
      html: `
        <p>Hi ${fullName},</p>
        <p>We received a request to reset your ScheduleMate password. Click below to set a new one:</p>
        <p><a href="${resetLink}">Reset My Password</a></p>
        <p>This link expires in 60 minutes. If you didn't request this, you can safely ignore this email.</p>
      `,
    });
    this.logger.log(`Password reset email sent to ${to}`);
  }
}