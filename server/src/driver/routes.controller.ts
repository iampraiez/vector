import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('driver/routes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class RoutesController {
  constructor(private readonly driverService: DriverService) {}

  @Get(':route_id/preview')
  getRoutePreview(
    @CurrentUser('id') userId: string,
    @Param('route_id') routeId: string,
  ) {
    return this.driverService.getRoutePreview(userId, routeId);
  }

  @Post(':route_id/start')
  @HttpCode(HttpStatus.OK)
  startRoute(
    @CurrentUser('id') userId: string,
    @Param('route_id') routeId: string,
  ) {
    return this.driverService.startRoute(userId, routeId);
  }

  @Post()
  createRoute(
    @CurrentUser('id') userId: string,
    @Body() data: { name: string; stops: any[] },
  ) {
    return this.driverService.createAdHocRoute(userId, data);
  }
}
