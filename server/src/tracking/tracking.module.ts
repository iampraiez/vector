import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { MapModule } from '../map/map.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MapModule, NotificationsModule],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
