import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('routes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @Roles('admin', 'manager')
  getRoutes(@CurrentUser('company_id') companyId: string, @Query() query: any) {
    return this.routesService.getRoutes(companyId, query);
  }

  @Post()
  @Roles('admin', 'manager')
  createRoute(@CurrentUser('company_id') companyId: string, @Body() dto: any) {
    return this.routesService.createRoute(companyId, dto);
  }

  @Get(':route_id')
  @Roles('admin', 'manager', 'driver')
  getRoute(
    @CurrentUser('company_id') companyId: string,
    @Param('route_id') routeId: string,
  ) {
    return this.routesService.getRoute(companyId, routeId);
  }

  @Patch(':route_id')
  @Roles('admin', 'manager')
  updateRoute(
    @CurrentUser('company_id') companyId: string,
    @Param('route_id') routeId: string,
    @Body() dto: any,
  ) {
    return this.routesService.updateRoute(companyId, routeId, dto);
  }

  @Delete(':route_id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRoute(
    @CurrentUser('company_id') companyId: string,
    @Param('route_id') routeId: string,
  ) {
    return this.routesService.deleteRoute(companyId, routeId);
  }

  @Post(':route_id/optimize')
  @Roles('admin', 'manager')
  optimizeRoute(
    @CurrentUser('company_id') companyId: string,
    @Param('route_id') routeId: string,
  ) {
    return this.routesService.optimizeRoute(companyId, routeId);
  }

  @Post(':route_id/assign')
  @Roles('admin', 'manager')
  assignRoute(
    @CurrentUser('company_id') companyId: string,
    @Param('route_id') routeId: string,
    @Body() dto: any,
  ) {
    return this.routesService.assignRoute(companyId, routeId, dto);
  }
}
