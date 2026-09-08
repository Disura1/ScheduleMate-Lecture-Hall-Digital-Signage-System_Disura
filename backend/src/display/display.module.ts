import { Module } from '@nestjs/common';
import { DisplayService } from './display.service';
import { DisplayController } from './display.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [DisplayService],
  controllers: [DisplayController],
  exports: [DisplayService], // SignageModule will need this for recordHeartbeat
})
export class DisplayModule {}