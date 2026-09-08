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
import { AcademicService } from './academic.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('academic')
@UseGuards(JwtAuthGuard)
export class AcademicController {
  constructor(private academicService: AcademicService) {}

  @Get('modules')
  getModules() {
    return this.academicService.getModules();
  }

  @Post('modules')
  createModule(@Body() dto: CreateModuleDto) {
    return this.academicService.createModule(dto);
  }

  @Patch('modules/:id')
  updateModule(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuleDto) {
    return this.academicService.updateModule(id, dto);
  }

  @Delete('modules/:id')
  deleteModule(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.deleteModule(id);
  }

  @Get('lecturers')
  getLecturers() {
    return this.academicService.getLecturers();
  }

  @Post('lecturers')
  createLecturer(@Body() dto: CreateLecturerDto) {
    return this.academicService.createLecturer(dto);
  }

  @Patch('lecturers/:id')
  updateLecturer(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLecturerDto) {
    return this.academicService.updateLecturer(id, dto);
  }

  @Delete('lecturers/:id')
  deleteLecturer(@Param('id', ParseIntPipe) id: number) {
    return this.academicService.deleteLecturer(id);
  }
}