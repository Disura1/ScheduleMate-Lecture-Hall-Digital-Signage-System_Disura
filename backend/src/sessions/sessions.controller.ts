import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentAdmin } from '../auth/current-admin.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto, @CurrentAdmin() admin: { id: number }) {
    return this.sessionsService.create(dto, admin.id);
  }

  @Get()
  findAll(@Query('roomId') roomId?: string, @Query('status') status?: string) {
    return this.sessionsService.findAll({
      roomId: roomId ? parseInt(roomId, 10) : undefined,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findOne(id);
  }
}