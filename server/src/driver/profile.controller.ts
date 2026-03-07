import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('driver/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('driver')
export class ProfileController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  getProfile(@CurrentUser('id') userId: string) {
    return { id: userId, name: 'John Doe', email: 'john@example.com' };
  }

  @Patch()
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: any,
  ) {
    return { message: 'Profile updated' };
  }

  @Post('avatar')
  uploadAvatar(@CurrentUser('id') userId: string, @Body() dto: any) {
    return { avatar_url: 'https://cloudinary.com/fake-url.jpg' };
  }
}
