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
import { MailModule } from '../mail/mail.module';
import { BullModule } from '@nestjs/bull';
import { MapModule } from '../map/map.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [
    MailModule,
    MapModule,
    NotificationsModule,
    TrackingModule,
    BullModule.registerQueue({ name: 'email' }, { name: 'account' }),
  ],
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
