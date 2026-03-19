import { Controller, Get, Post, UseGuards, Query, Body } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExportHistoryDto } from './dto/driver.dto';

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
    return this.driverService.getHistory(userId, page, limit);
  }

  @Post('export')
  exportHistory(
    @CurrentUser('id') userId: string,
    @Body() dto: ExportHistoryDto,
  ) {
    return this.driverService.exportHistory(userId, dto);
  }
}
