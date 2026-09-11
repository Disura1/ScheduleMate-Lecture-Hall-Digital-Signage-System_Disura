import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CancelSessionDto } from './dto/cancel-session.dto';
import { RescheduleSessionDto } from './dto/reschedule-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentAdmin } from '../auth/current-admin.decorator';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto, @CurrentAdmin() admin: { id: number }) {
    return this.sessionsService.create(dto, admin.id);
  }

  @Get()
  findAll(
    @Query('roomId') roomId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('timeFrom') timeFrom?: string,
    @Query('timeTo') timeTo?: string,
    @Query('buildingId') buildingId?: string,
    @Query('floorId') floorId?: string,
    @Query('sideId') sideId?: string,
    @Query('moduleId') moduleId?: string,
    @Query('lecturerId') lecturerId?: string,
  ) {
    return this.sessionsService.findAll({
      roomId: roomId ? parseInt(roomId, 10) : undefined,
      status,
      date,
      timeFrom,
      timeTo,
      buildingId: buildingId ? parseInt(buildingId, 10) : undefined,
      floorId: floorId ? parseInt(floorId, 10) : undefined,
      sideId: sideId ? parseInt(sideId, 10) : undefined,
      moduleId: moduleId ? parseInt(moduleId, 10) : undefined,
      lecturerId: lecturerId ? parseInt(lecturerId, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @Body() dto: CancelSessionDto) {
    return this.sessionsService.cancel(id, dto.reason);
  }

  @Patch(':id/reopen')
  reopen(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.reopen(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSessionDto) {
    return this.sessionsService.update(id, dto);
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RescheduleSessionDto,
    @CurrentAdmin() admin: { id: number },
  ) {
    return this.sessionsService.reschedule(id, dto, admin.id);
  }

  @Get(':id/history')
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.getHistory(id);
  }
}