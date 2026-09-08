import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { DisplayService } from './display.service';
import { CreateDisplayDto } from './dto/create-display.dto';
import { ReassignDisplayDto } from './dto/reassign-display.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('displays')
@UseGuards(JwtAuthGuard)
export class DisplayController {
  constructor(private displayService: DisplayService) {}

  @Get()
  getAll() {
    return this.displayService.getAll();
  }

  @Post()
  register(@Body() dto: CreateDisplayDto) {
    return this.displayService.register(dto);
  }

  @Patch(':id/reassign')
  reassign(@Param('id', ParseIntPipe) id: number, @Body() dto: ReassignDisplayDto) {
    return this.displayService.reassign(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.displayService.remove(id);
  }
}