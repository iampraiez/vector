import { Controller, Get, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('driver/home')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class HomeController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  getHome(@CurrentUser('id') userId: string) {
    return this.driverService.getHomeSummary(userId);
  }
}
