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
  CreateOrderDto,
  PaginationDto,
  UpdateOrderDto,
} from './dto/dashboard.dto';

@Controller('dashboard/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class OrdersController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getOrders(
    @CurrentUser('company_id') companyId: string,
    @Query() query: PaginationDto & { status?: string },
  ) {
    return this.dashboardService.getOrders(companyId, query);
  }

  @Post()
  createOrder(
    @CurrentUser('company_id') companyId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.dashboardService.createOrder(companyId, dto);
  }

  @Patch(':stop_id')
  updateOrder(
    @CurrentUser('company_id') companyId: string,
    @Param('stop_id') stopId: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.dashboardService.updateOrder(companyId, stopId, dto);
  }

  @Delete(':stop_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOrder(
    @CurrentUser('company_id') companyId: string,
    @Param('stop_id') stopId: string,
  ) {
    return this.dashboardService.deleteOrder(companyId, stopId);
  }

  @Post('bulk')
  importBulk(
    @CurrentUser('company_id') companyId: string,
    @Body() data: { orders: CreateOrderDto[] },
  ) {
    return this.dashboardService.importBulkOrders(companyId, data.orders);
  }
}
