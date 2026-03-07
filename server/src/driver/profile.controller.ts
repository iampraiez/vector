import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('driver/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class ProfileController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  getProfile(@CurrentUser('id') userId: string) {
    return this.driverService.getProfile(userId);
  }

  @Patch()
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: any,
  ) {
    return this.driverService.updateProfile(userId, dto);
  }

  @Post('avatar')
  uploadAvatar(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.driverService.uploadAvatar(userId, dto);
  }
}
