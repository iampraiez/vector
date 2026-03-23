import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChangePlanDto } from './dto/dashboard.dto';

@Controller('dashboard/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class BillingController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getBillingInfo(@CurrentUser('company_id') companyId: string) {
    return this.dashboardService.getBillingInfo(companyId);
  }

  @Get('invoices')
  getInvoices(@CurrentUser('company_id') companyId: string) {
    return this.dashboardService.getInvoices(companyId);
  }

  @Post('plan')
  changePlan(
    @CurrentUser('company_id') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePlanDto,
  ) {
    return this.dashboardService.changePlan(companyId, dto, userId);
  }

  @Post('payment-method')
  updatePaymentMethod(@CurrentUser('company_id') companyId: string) {
    return this.dashboardService.updatePaymentMethod(companyId);
  }

  @Delete('cancel')
  @HttpCode(HttpStatus.OK)
  cancelPlan(@CurrentUser('company_id') companyId: string) {
    return this.dashboardService.cancelPlan(companyId);
  }
}
