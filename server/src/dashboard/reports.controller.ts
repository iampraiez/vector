import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReportQueryDto, PaginationDto } from './dto/dashboard.dto';

@Controller('dashboard/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class ReportsController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getReportSummary(
    @CurrentUser('company_id') companyId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.dashboardService.getReportSummary(companyId, query);
  }

  @Get('charts')
  getReportCharts(
    @CurrentUser('company_id') companyId: string,
    @Query() query: ReportQueryDto,
  ) {
    return this.dashboardService.getReportCharts(companyId, query);
  }

  @Get('performance')
  getDriverPerformance(
    @CurrentUser('company_id') companyId: string,
    @Query() query: ReportQueryDto & PaginationDto,
  ) {
    return this.dashboardService.getDriverPerformance(companyId, query);
  }

  @Get('export')
  exportReport(
    @CurrentUser('company_id') companyId: string,
    @Query() query: ReportQueryDto,
  ) {
    // Stub implementation
    return {
      message: 'Report generation started. You will be notified when it is ready.',
    };
  }
}
