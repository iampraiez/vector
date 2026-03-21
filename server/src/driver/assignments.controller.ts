import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OptimizeRouteDto } from './dto/driver.dto';

@Controller('driver/assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class AssignmentsController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  getAssignments(@CurrentUser('id') userId: string) {
    return this.driverService.getAssignments(userId);
  }

  @Post('optimize')
  optimizeAssignments(
    @CurrentUser('id') userId: string,
    @Body() dto: OptimizeRouteDto,
  ) {
    return this.driverService.optimizeAssignments(userId, dto);
  }
}
