import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StructureModule } from './structure/structure.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [PrismaModule, AuthModule, StructureModule, SessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}