import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { OverviewController } from './overview.controller';
import { OrdersController } from './orders.controller';
import { DriversController } from './drivers.controller';
import { TrackingController } from './tracking.controller';
import { ReportsController } from './reports.controller';
import { BillingController } from './billing.controller';
import { SettingsController } from './settings.controller';
import { DashboardNotificationsController } from './notifications.controller';

@Module({
  controllers: [
    OverviewController,
    OrdersController,
    DriversController,
    TrackingController,
    ReportsController,
    BillingController,
    SettingsController,
    DashboardNotificationsController,
  ],
  providers: [DashboardService],
})
export class DashboardModule {}
