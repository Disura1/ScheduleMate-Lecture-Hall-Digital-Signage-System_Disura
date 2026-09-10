import { Module } from '@nestjs/common';
import { AdminAccountsService } from './admin-accounts.service';
import { AdminAccountsController } from './admin-accounts.controller';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AuthModule, EmailModule],
  providers: [AdminAccountsService],
  controllers: [AdminAccountsController],
})
export class AdminAccountsModule {}