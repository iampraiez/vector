import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OnboardingDto } from './dto/driver.dto';

@Controller('driver/onboarding')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class OnboardingController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  completeOnboarding(
    @CurrentUser('id') userId: string,
    @Body() dto: OnboardingDto,
  ) {
    return this.driverService.completeOnboarding(userId, dto);
  }
}
