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
    return { data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } };
  }

  @Patch(':notification_id/read')
  markRead(
    @CurrentUser('id') userId: string,
    @Param('notification_id') notificationId: string,
  ) {
    return { message: 'Marked read' };
  }

  @Post('read-all')
  markAllRead(@CurrentUser('id') userId: string) {
    return { message: 'All marked read' };
  }
}
