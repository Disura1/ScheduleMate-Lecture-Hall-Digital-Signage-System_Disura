import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DisplayService } from './display.service';
import { CreateDisplayDto } from './dto/create-display.dto';
import { UpdateDisplayDto } from './dto/update-display.dto';
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

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDisplayDto) {
    return this.displayService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.displayService.remove(id);
  }
}
