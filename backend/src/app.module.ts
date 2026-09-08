import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StructureModule } from './structure/structure.module';
import { SessionsModule } from './sessions/sessions.module';
import { AcademicModule } from './academic/academic.module';
import { DisplayModule } from './display/display.module';

@Module({
  imports: [PrismaModule, AuthModule, StructureModule, SessionsModule, AcademicModule, DisplayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}