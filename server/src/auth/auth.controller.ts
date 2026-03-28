import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard, SkipThrottle } from '@nestjs/throttler';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import {
  SignInDto,
  SignUpDriverDto,
  SignUpFleetDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  ResendVerificationDto,
  UpdateDriverProfileDto,
  JoinCompanyDto,
} from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    device_id?: string;
  };
}

@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Public()
  @Get('company/validate/:code')
  @HttpCode(HttpStatus.OK)
  validateCompanyCode(@Param('code') code: string) {
    return this.authService.validateCompanyCode(code);
  }

  @Public()
  @Post('sign-up/driver')
  signUpDriver(@Body() dto: SignUpDriverDto) {
    return this.authService.signUpDriver(dto);
  }

  @Public()
  @Post('sign-up/fleet')
  signUpFleet(@Body() dto: SignUpFleetDto) {
    return this.authService.signUpFleet(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Patch('driver/profile')
  updateDriverProfile(
    @Request() req: RequestWithUser,
    @Body() dto: UpdateDriverProfileDto,
  ) {
    return this.authService.updateDriverProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Request() req: RequestWithUser) {
    const authHeader = req.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';
    const deviceId = req.user.device_id || 'default';
    await this.authService.signOut(req.user.id, token, deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Post('complete-onboarding')
  @HttpCode(HttpStatus.OK)
  completeOnboarding(
    @Request() req: RequestWithUser,
    @Body() dto?: UpdateDriverProfileDto,
  ) {
    return this.authService.completeOnboarding(req.user.id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Post('join-company')
  @HttpCode(HttpStatus.OK)
  joinCompany(@Request() req: RequestWithUser, @Body() dto: JoinCompanyDto) {
    return this.authService.joinCompany(req.user.id, dto);
  }
}
