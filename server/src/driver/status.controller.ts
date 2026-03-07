import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateStatusDto, UpdateLocationDto } from './dto/driver.dto';

@Controller('driver/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class StatusController {
  constructor(private readonly driverService: DriverService) {}

  @Patch()
  updateStatus(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return { status: dto.status };
  }

  @Patch('location')
  updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLocationDto,
  ) {
     return { lat: dto.lat, lng: dto.lng };
  }
}
