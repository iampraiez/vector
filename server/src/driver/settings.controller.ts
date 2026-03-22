import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { UpdateDriverSettingsDto } from './dto/driver.dto';
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
  updateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateDriverSettingsDto,
  ) {
    return this.driverService.updateSettings(userId, dto);
  }

  @Post('otp/request')
  requestOtp(
    @CurrentUser('id') userId: string,
    @Body() dto: { action: string },
  ) {
    return this.driverService.requestSettingsOtp(userId, dto);
  }

  @Post('otp/verify')
  verifyOtp(
    @CurrentUser('id') userId: string,
    @Body() dto: { action: string; otp: string },
  ) {
    return this.driverService.verifySettingsOtp(userId, dto);
  }
}
