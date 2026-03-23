import { Controller, Patch, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class FcmController {
  constructor(private readonly driverService: DriverService) {}

  @Patch('fcm-token')
  updateFcmToken(
    @CurrentUser('id') userId: string,
    @Body('fcm_token') fcmToken: string,
  ) {
    return this.driverService.updateFcmToken(userId, fcmToken);
  }
}
