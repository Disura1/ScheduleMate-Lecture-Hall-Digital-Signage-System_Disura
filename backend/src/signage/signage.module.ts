import { Module } from '@nestjs/common';
import { SignageService } from './signage.service';
import { SignageController } from './signage.controller';
import { DisplayModule } from '../display/display.module';

@Module({
  imports: [DisplayModule], // needed for DisplayService.recordHeartbeat — note: no AuthModule import, this stays public
  providers: [SignageService],
  controllers: [SignageController],
})
export class SignageModule {}