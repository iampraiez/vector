import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('driver/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class SettingsController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  getSettings(@CurrentUser('id') userId: string) {
    return this.driverService.getSettings(userId);
  }

  @Patch()
  updateSettings(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.driverService.updateSettings(userId, dto);
  }
}
