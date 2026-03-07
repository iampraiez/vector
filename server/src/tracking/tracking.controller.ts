import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('track')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get()
  @Public()
  getTrackingData(@Query('token') token: string) {
    return this.trackingService.getTrackingData(token);
  }

  @Post('rate')
  @Public()
  rateDelivery(
    @Query('token') token: string,
    @Body() dto: { rating: number; comment?: string },
  ) {
    return this.trackingService.rateDelivery(token, dto);
  }
}
