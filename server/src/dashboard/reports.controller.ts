import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
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
  async exportReport(
    @CurrentUser('company_id') companyId: string,
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ) {
    const csvData = await this.dashboardService.generateReportCsv(
      companyId,
      query,
    );
    res.header('Content-Type', 'text/csv');
    res.attachment('vector_report.csv');
    return res.send(csvData);
  }
}
