import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('driver/history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class HistoryController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  getHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return { data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } };
  }
}
