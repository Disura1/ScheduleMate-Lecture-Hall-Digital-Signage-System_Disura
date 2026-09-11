import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StructureModule } from './structure/structure.module';
import { SessionsModule } from './sessions/sessions.module';
import { AcademicModule } from './academic/academic.module';
import { DisplayModule } from './display/display.module';
import { SignageModule } from './signage/signage.module';
import { AdminAccountsModule } from './admin-accounts/admin-accounts.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, AuthModule, StructureModule, SessionsModule, AcademicModule, DisplayModule, SignageModule, AdminAccountsModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}