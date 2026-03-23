import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CreateOptimizedRouteDto, CreateAdHocRouteDto } from './dto/driver.dto';

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

  @Patch(':route_id/reject')
  rejectRoute(
    @CurrentUser('id') userId: string,
    @Param('route_id') routeId: string,
  ) {
    return this.driverService.rejectRoute(userId, routeId);
  }

  @Post(':route_id/start')
  @HttpCode(HttpStatus.OK)
  startRoute(
    @CurrentUser('id') userId: string,
    @Param('route_id') routeId: string,
  ) {
    return this.driverService.startRoute(userId, routeId);
  }

  @Post('create-optimized')
  createOptimizedRoute(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOptimizedRouteDto,
  ) {
    return this.driverService.createOptimizedRoute(userId, dto);
  }

  @Post()
  createRoute(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAdHocRouteDto,
  ) {
    return this.driverService.createAdHocRoute(userId, dto);
  }
}
