import { Controller, Get, Patch, Post, Param, UseGuards, Query } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('driver/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class DriverNotificationsController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.driverService.getNotifications(userId, page, limit);
  }

  @Patch(':notification_id/read')
  markRead(
    @CurrentUser('id') userId: string,
    @Param('notification_id') notificationId: string,
  ) {
    return this.driverService.markNotificationRead(userId, notificationId);
  }

  @Post('read-all')
  markAllRead(@CurrentUser('id') userId: string) {
    return this.driverService.markAllNotificationsRead(userId);
  }
}
