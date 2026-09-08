import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminAccountsService } from './admin-accounts.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin-accounts')
export class AdminAccountsController {
  constructor(private adminAccountsService: AdminAccountsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  findAll() {
    return this.adminAccountsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateAdminDto) {
    return this.adminAccountsService.create(dto);
  }

  // Deliberately public/unauthenticated — this is what the invited admin clicks before they can log in at all
  @Post('activate')
  activate(@Body() dto: ActivateAccountDto) {
    return this.adminAccountsService.activate(dto.token, dto.password);
  }
}