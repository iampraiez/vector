import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CompleteDeliveryDto, FailDeliveryDto } from './dto/driver.dto';

@Controller('driver/delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class DeliveryController {
  constructor(private readonly driverService: DriverService) {}

  @Post(':stop_id/complete')
  completeDelivery(
    @CurrentUser('id') userId: string,
    @Param('stop_id') stopId: string,
    @Body() dto: CompleteDeliveryDto,
  ) {
    return { message: 'Delivery completed' };
  }

  @Post(':stop_id/fail')
  failDelivery(
    @CurrentUser('id') userId: string,
    @Param('stop_id') stopId: string,
    @Body() dto: FailDeliveryDto,
  ) {
    return { message: 'Delivery failed' };
  }
}
