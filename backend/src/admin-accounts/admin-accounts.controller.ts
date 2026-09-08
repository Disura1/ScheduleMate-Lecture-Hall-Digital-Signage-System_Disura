import { Body, Controller, Get, Post, UseGuards, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { AdminAccountsService } from './admin-accounts.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ActivateAccountDto } from './dto/activate-account.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentAdmin } from '../auth/current-admin.decorator';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { SubmitRequestDto } from './dto/submit-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';

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

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  deactivate(@Param('id', ParseIntPipe) id: number, @CurrentAdmin() admin: { id: number }) {
    return this.adminAccountsService.deactivate(id, admin.id);
  }

  @Patch(':id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  reactivate(@Param('id', ParseIntPipe) id: number) {
    return this.adminAccountsService.reactivate(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  updateProfile(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminDto) {
    return this.adminAccountsService.updateProfile(id, dto);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: 'ADMIN' | 'SUPER_ADMIN',
    @CurrentAdmin() admin: { id: number },
  ) {
    return this.adminAccountsService.updateRole(id, role, admin.id);
  }

  @Post('profile-change-requests')
  @UseGuards(JwtAuthGuard)
  submitRequest(@Body() dto: SubmitRequestDto, @CurrentAdmin() admin: { id: number }) {
    return this.adminAccountsService.submitProfileChangeRequest(admin.id, dto);
  }

  @Get('profile-change-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  getPendingRequests() {
    return this.adminAccountsService.getPendingRequests();
  }

  @Patch('profile-change-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  approveRequest(@Param('id', ParseIntPipe) id: number, @CurrentAdmin() admin: { id: number }) {
    return this.adminAccountsService.approveRequest(id, admin.id);
  }

  @Patch('profile-change-requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectRequestDto,
    @CurrentAdmin() admin: { id: number },
  ) {
    return this.adminAccountsService.rejectRequest(id, admin.id, dto.rejectionReason);
  }
}