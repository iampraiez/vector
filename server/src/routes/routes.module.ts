import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { MapModule } from '../map/map.module';

@Module({
  imports: [MapModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
