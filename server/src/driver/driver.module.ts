import { Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { HomeController } from './home.controller';
import { StatusController } from './status.controller';
import { AssignmentsController } from './assignments.controller';
import { RoutesController } from './routes.controller';
import { NavigationController } from './navigation.controller';
import { DeliveryController } from './delivery.controller';
import { HistoryController } from './history.controller';
import { ProfileController } from './profile.controller';
import { SettingsController } from './settings.controller';
import { DriverNotificationsController } from './notifications.controller';
import { OnboardingController } from './onboarding.controller';
import { MailModule } from '../mail/mail.module';
import { MapModule } from '../map/map.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MailModule,
    MapModule,
    BullModule.registerQueue({ name: 'account' }),
  ],
  controllers: [
    HomeController,
    StatusController,
    AssignmentsController,
    RoutesController,
    NavigationController,
    DeliveryController,
    HistoryController,
    ProfileController,
    SettingsController,
    DriverNotificationsController,
    OnboardingController,
  ],
  providers: [DriverService],
})
export class DriverModule {}
