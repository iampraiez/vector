import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TrackingService } from '../tracking/tracking.service';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('dashboard/tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class TrackingController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly trackingService: TrackingService,
  ) {}

  @Get('drivers')
  getLiveTracking(@CurrentUser('company_id') companyId: string) {
    return this.dashboardService.getLiveTracking(companyId);
  }

  @Post('rate')
  @Public()
  @HttpCode(HttpStatus.OK)
  rateDelivery(
    @Query('token') token: string,
    @Body() dto: { rating: number; comment?: string },
  ) {
    return this.trackingService.rateDelivery(token, dto);
  }
}
