import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StructureService } from './structure.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('structure')
@UseGuards(JwtAuthGuard) // every route here requires a logged-in admin — any role
export class StructureController {
  constructor(private structureService: StructureService) {}

  @Get('buildings')
  getBuildings() {
    return this.structureService.getBuildings();
  }

  @Get('floors')
  getFloors(@Query('buildingId', ParseIntPipe) buildingId: number) {
    return this.structureService.getFloors(buildingId);
  }

  @Get('sides')
  getSides(@Query('floorId', ParseIntPipe) floorId: number) {
    return this.structureService.getSides(floorId);
  }

  @Get('rooms')
  getRooms(
    @Query('buildingId') buildingId?: string,
    @Query('floorId') floorId?: string,
    @Query('sideId') sideId?: string,
  ) {
    return this.structureService.getRooms({
      buildingId: buildingId ? parseInt(buildingId, 10) : undefined,
      floorId: floorId ? parseInt(floorId, 10) : undefined,
      sideId: sideId ? parseInt(sideId, 10) : undefined,
    });
  }

  @Post('rooms')
  createRoom(@Body() dto: CreateRoomDto) {
    return this.structureService.createRoom(dto);
  }

  @Patch('rooms/:id')
  updateRoom(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.structureService.updateRoom(id, dto);
  }

  @Delete('rooms/:id')
  deleteRoom(@Param('id', ParseIntPipe) id: number) {
    return this.structureService.deleteRoom(id);
  }

  @Get('rooms/status')
  getRoomStatus(
    @Query('buildingId') buildingId?: string,
    @Query('floorId') floorId?: string,
    @Query('sideId') sideId?: string,
    @Query('search') search?: string,
  ) {
    return this.structureService.getRoomStatus({
      buildingId: buildingId ? parseInt(buildingId, 10) : undefined,
      floorId: floorId ? parseInt(floorId, 10) : undefined,
      sideId: sideId ? parseInt(sideId, 10) : undefined,
      search,
    });
  }
}