import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard/tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class TrackingController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('drivers')
  getLiveTracking(@CurrentUser('company_id') companyId: string) {
    return this.dashboardService.getLiveTracking(companyId);
  }
}
