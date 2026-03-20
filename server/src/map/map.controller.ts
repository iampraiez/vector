import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MapService } from './map.service';
import { GeocodeDto, DirectionsDto, ReverseGeocodeDto } from './dto/map.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('map')
@UseGuards(JwtAuthGuard)
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Post('geocode')
  geocode(@Body() dto: GeocodeDto) {
    return this.mapService.geocode(dto);
  }

  @Post('directions')
  getDirections(@Body() dto: DirectionsDto) {
    return this.mapService.getDirections(dto);
  }

  @Post('reverse-geocode')
  reverseGeocode(@Body() dto: ReverseGeocodeDto) {
    return this.mapService.reverseGeocode(dto);
  }
}
