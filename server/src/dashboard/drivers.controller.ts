import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
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
import {
  CreateDriverDto,
  DriverQueryDto,
  UpdateDriverDto,
} from './dto/dashboard.dto';

@Controller('dashboard/drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class DriversController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDrivers(
    @CurrentUser('company_id') companyId: string,
    @Query() query: DriverQueryDto,
  ) {
    return this.dashboardService.getDrivers(companyId, query);
  }
  @Get('active')
  getActiveDrivers(@CurrentUser('company_id') companyId: string) {
    return this.dashboardService.getActiveDrivers(companyId);
  }

  @Post('invite')
  createDriverInvite(
    @CurrentUser('company_id') companyId: string,
    @Body() dto: CreateDriverDto,
  ) {
    return this.dashboardService.createDriverInvite(companyId, dto);
  }

  @Get(':driver_id')
  getDriverDetail(
    @CurrentUser('company_id') companyId: string,
    @Param('driver_id') driverId: string,
  ) {
    return this.dashboardService.getDriverDetail(companyId, driverId);
  }

  @Patch(':driver_id')
  updateDriver(
    @CurrentUser('company_id') companyId: string,
    @Param('driver_id') driverId: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.dashboardService.updateDriver(companyId, driverId, dto);
  }

  @Delete(':driver_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDriver(
    @CurrentUser('company_id') companyId: string,
    @CurrentUser('id') userId: string,
    @Param('driver_id') driverId: string,
  ) {
    return this.dashboardService.deleteDriver(companyId, driverId, userId);
  }
}
