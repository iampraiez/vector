import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { MapModule } from '../map/map.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MapModule, NotificationsModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
