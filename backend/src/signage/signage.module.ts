import { Module } from '@nestjs/common';
import { SignageService } from './signage.service';
import { SignageController } from './signage.controller';
import { DisplayModule } from '../display/display.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DisplayModule, NotificationsModule],
  providers: [SignageService],
  controllers: [SignageController],
})
export class SignageModule {}