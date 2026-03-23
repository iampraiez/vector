import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
  UpdateCompanySettingsDto,
  CreateApiKeyDto,
  UpdateNotificationsDto,
} from './dto/settings.dto';

@Controller('dashboard/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class SettingsController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getSettings(@CurrentUser('company_id') companyId: string) {
    return this.dashboardService.getSettings(companyId);
  }

  @Patch('company')
  updateSettings(
    @CurrentUser('company_id') companyId: string,
    @Body() dto: UpdateCompanySettingsDto,
  ) {
    return this.dashboardService.updateSettings(companyId, dto);
  }

  @Patch('notifications')
  updateNotifications(
    @CurrentUser('company_id') companyId: string,
    @Body() dto: UpdateNotificationsDto,
  ) {
    return this.dashboardService.updateNotifications(companyId, dto);
  }

  @Post('regenerate-code')
  regenerateAccessCode(
    @CurrentUser('company_id') companyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.dashboardService.regenerateAccessCode(companyId, userId);
  }

  @Post('api-keys')
  createApiKey(
    @CurrentUser('company_id') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.dashboardService.createApiKey(companyId, dto, userId);
  }

  @Delete('api-keys/:key_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeApiKey(
    @CurrentUser('company_id') companyId: string,
    @Param('key_id') keyId: string,
  ) {
    return this.dashboardService.revokeApiKey(companyId, keyId);
  }

  @Post('otp/request')
  requestOtp(
    @CurrentUser('id') userId: string,
    @CurrentUser('company_id') companyId: string,
    @Body() dto: { action: string },
  ) {
    return this.dashboardService.requestSettingsOtp(
      userId,
      companyId,
      dto.action,
    );
  }

  @Post('otp/verify')
  verifyOtp(
    @CurrentUser('id') userId: string,
    @CurrentUser('company_id') companyId: string,
    @Body() dto: { action: string; otp: string },
  ) {
    return this.dashboardService.verifySettingsOtp(
      userId,
      companyId,
      dto.action,
      dto.otp,
    );
  }
}
