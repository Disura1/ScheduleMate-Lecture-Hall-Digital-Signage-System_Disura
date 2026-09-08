import { Controller, Get, Param } from '@nestjs/common';
import { SignageService } from './signage.service';

@Controller('signage')
export class SignageController {
  constructor(private signageService: SignageService) {}

  // Deliberately NO @UseGuards() here — this is the one public, unauthenticated endpoint (per our Architecture diagram)
  @Get(':deviceIdentifier')
  getSlideData(@Param('deviceIdentifier') deviceIdentifier: string) {
    return this.signageService.getSlideData(deviceIdentifier);
  }
}