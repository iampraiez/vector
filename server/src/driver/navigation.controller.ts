import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('driver/navigation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class NavigationController {
  constructor(private readonly driverService: DriverService) {}

  @Get('stops/:stop_id')
  getStop(
    @CurrentUser('id') userId: string,
    @Param('stop_id') stopId: string,
  ) {
    return { stop_id: stopId };
  }

  @Patch('stops/:stop_id/arrive')
  arriveAtStop(
    @CurrentUser('id') userId: string,
    @Param('stop_id') stopId: string,
  ) {
    return { message: 'Arrived' };
  }

  @Patch('stops/:stop_id/skip')
  skipStop(
    @CurrentUser('id') userId: string,
    @Param('stop_id') stopId: string,
  ) {
    return { message: 'Skipped' };
  }
}
