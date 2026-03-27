import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from './dto/dashboard.dto';

@Controller('dashboard/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class DashboardNotificationsController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getNotifications(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.dashboardService.getNotifications(userId, query);
  }

  @Patch(':notification_id/read')
  markNotificationRead(
    @CurrentUser('id') userId: string,
    @Param('notification_id') notificationId: string,
  ) {
    return this.dashboardService.markNotificationRead(userId, notificationId);
  }

  @Post('read-all')
  markAllRead(@CurrentUser('id') userId: string) {
    return this.dashboardService.markNotificationRead(userId, 'all');
  }

  @Delete(':notification_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteNotification(
    @CurrentUser('id') userId: string,
    @Param('notification_id') notificationId: string,
  ) {
    return this.dashboardService.deleteNotification(userId, notificationId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearAll(@CurrentUser('id') userId: string) {
    return this.dashboardService.deleteNotification(userId, 'all');
  }
}
