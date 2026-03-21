import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { MapModule } from '../map/map.module';

@Module({
  imports: [MapModule],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
