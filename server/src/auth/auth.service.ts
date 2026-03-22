import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
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
import { JwtPayload } from './interfaces/auth.interface';
import { STANDARD_QUEUE_OPTIONS } from '../queue/bull-job-options';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async generateTokens(
    user: {
      id: string;
      email: string;
      role: string;
      company_id: string;
      email_verified?: boolean;
      is_onboarded?: boolean;
      full_name?: string;
    },
    device_id: string = 'default',
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      device_id,
      email_verified: user.email_verified ?? false,
      is_onboarded: user.is_onboarded ?? false,
      full_name: user.full_name ?? '',
    };

    const accessExpires =
      this.configService.get<string>('JWT_ACCESS_EXPIRATION', '1h') ?? '1h';
    const refreshExpires =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d') ?? '7d';

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync<JwtPayload>(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        // jwt `expiresIn` typing uses `ms.StringValue`; env vars are plain strings.
        expiresIn: accessExpires as unknown as NonNullable<
          Parameters<JwtService['signAsync']>[1]
        >['expiresIn'],
      }),
      this.jwtService.signAsync<JwtPayload>(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpires as unknown as NonNullable<
          Parameters<JwtService['signAsync']>[1]
        >['expiresIn'],
      }),
    ]);

    // Store refresh token hash in Redis (keyed by userId and deviceId)
    const tokenHash = await bcrypt.hash(refresh_token, 10);
    const expirationStr = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
      '7d',
    );
    const ttlDays = parseInt(expirationStr.replace('d', ''), 10);
    await this.redis.set(
      `rt:${user.id}:${device_id}`,
      tokenHash,
      ttlDays * 24 * 60 * 60,
    );

    return { access_token, refresh_token, expires_in: 3600, user, device_id };
  }

  async validateCompanyCode(code: string) {
    const company = await this.prisma.company.findUnique({
      where: { company_code: code.toUpperCase() },
      select: { id: true, name: true },
    });

    return {
      valid: !!company,
      company_name: company?.name,
    };
  }

  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { company: true, driver_profile: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Require email verification before logging in
    if (!user.email_verified) {
      // Generate a new OTP and queue email since the old one might have expired
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      await this.redis.set(`verify:${user.email}`, token, 3600);
      await this.emailQueue.add(
        'sendVerification',
        {
          email: user.email,
          token,
        },
        STANDARD_QUEUE_OPTIONS,
      );

      throw new UnauthorizedException({
        statusCode: 403,
        message: 'EMAIL_NOT_VERIFIED',
        error:
          'Please verify your email address. A new verification code has been sent to your inbox.',
      });
    }

    return this.generateTokens(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        email_verified: user.email_verified,
        is_onboarded: Boolean(
          (user as unknown as { is_onboarded: boolean }).is_onboarded,
        ),
        full_name: user.full_name,
      },
      dto.device_id,
    );
  }

  async signUpDriver(dto: SignUpDriverDto) {
    const company = await this.prisma.company.findUnique({
      where: { company_code: dto.company_code },
    });

    if (!company) {
      throw new NotFoundException('No company found with that code');
    }

    const billing = await this.prisma.billingRecord.findFirst({
      where: { company_id: company.id },
    });
    const driverCount = await this.prisma.driver.count({
      where: { company_id: company.id },
    });
    if (
      billing &&
      billing.seats_included > 0 &&
      driverCount >= billing.seats_included
    ) {
      throw new ForbiddenException(
        'This company has reached its driver seat limit. Ask your manager to upgrade the plan.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        full_name: dto.full_name,
        phone: dto.phone,
        role: 'driver',
        company_id: company.id,
        driver_profile: {
          create: {
            company_id: company.id,
            vehicle_type: dto.vehicle_type,
            vehicle_plate: dto.vehicle_plate,
          },
        },
      },
    });

    // Generate OTP
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`verify:${user.email}`, token, 3600);

    await this.emailQueue.add(
      'sendVerification',
      { email: user.email, token },
      STANDARD_QUEUE_OPTIONS,
    );

    return {
      message: 'Account created. Please verify your email.',
    };
  }

  async signUpFleet(dto: SignUpFleetDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const companyCode = `FLEET-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const hashedPassword = await this.hashPassword(dto.password);

    const result = await this.prisma.$transaction(async (prisma) => {
      const company = await prisma.company.create({
        data: {
          name: dto.company_name,
          company_code: companyCode,
          subscription_tier: dto.plan_id,
        },
      });

      const isPaidPlan = dto.plan_id === 'starter' || dto.plan_id === 'growth';
      const now = new Date();
      const trialDays = 14;
      const trialEndDate = new Date(
        now.getTime() + trialDays * 24 * 60 * 60 * 1000,
      );
      const activeEndDate = new Date(
        now.getTime() + 3650 * 24 * 60 * 60 * 1000,
      ); // 10 years for free

      await prisma.billingRecord.create({
        data: {
          company_id: company.id,
          plan_id: dto.plan_id,
          status: isPaidPlan ? 'trialing' : 'active',
          current_period_start: now,
          current_period_end: isPaidPlan ? trialEndDate : activeEndDate,
          seats_included:
            dto.plan_id === 'free' ? 2 : dto.plan_id === 'starter' ? 5 : 20,
        },
      });

      const user = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          full_name: dto.full_name,
          role: 'admin',
          company_id: company.id,
        },
      });

      return { company, user };
    });

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`verify:${result.user.email}`, token, 3600);
    await this.emailQueue.add(
      'sendVerification',
      {
        email: result.user.email,
        token,
      },
      STANDARD_QUEUE_OPTIONS,
    );

    return {
      message: 'Company and account created. Please verify your email.',
      user_id: result.user.id,
      company: {
        id: result.company.id,
        name: result.company.name,
        company_code: result.company.company_code,
      },
      checkout_url: 'https://paystack.com/pay/stub',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const storedToken = await this.redis.get(`verify:${dto.email}`);
    if (!storedToken || storedToken !== dto.token) {
      throw new UnauthorizedException('Token is invalid or expired.');
    }

    await this.redis.del(`verify:${dto.email}`);

    // Mark the user's email as verified in the database
    const user = await this.prisma.user.update({
      where: { email: dto.email },
      data: { email_verified: true },
      include: { driver_profile: true },
    });

    // Generate tokens for auto-login
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      email_verified: true,
      is_onboarded: Boolean(
        (user as unknown as { is_onboarded: boolean }).is_onboarded,
      ),
      full_name: user.full_name,
    });

    return {
      message: 'Email verified successfully.',
      ...tokens,
    };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Quietly return even if user not found for security
      return { message: 'If an account exists, a new code has been sent.' };
    }

    if (user.email_verified) {
      throw new ConflictException('Email is already verified');
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`verify:${user.email}`, token, 3600);
    await this.emailQueue.add(
      'sendVerification',
      { email: user.email, token },
      STANDARD_QUEUE_OPTIONS,
    );

    return { message: 'A new verification code has been sent to your inbox.' };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refresh_token,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      const deviceId = payload.device_id || 'default';
      const storedHash = await this.redis.get(`rt:${payload.sub}:${deviceId}`);

      // If hash exists, we MUST verify it.
      // If it DOESN'T exist (e.g. Redis cleared), we don't fail immediately
      // as long as the refresh token itself is cryptographically valid (which it is, since verifyAsync passed).
      if (storedHash) {
        const isMatch = await bcrypt.compare(dto.refresh_token, storedHash);
        if (!isMatch) throw new UnauthorizedException('Invalid refresh token');
      } else {
        // console.warn(`Refresh session not found in Redis for user ${payload.sub}, allowing based on JWT validity`);
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { company: true, driver_profile: true },
      });

      if (!user) throw new UnauthorizedException('User not found');

      return this.generateTokens(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          company_id: user.company_id,
          email_verified: user.email_verified,
          is_onboarded: Boolean(
            (user as unknown as { is_onboarded: boolean }).is_onboarded,
          ),
          full_name: user.full_name,
        },
        deviceId,
      );
    } catch {
      throw new UnauthorizedException('Token invalid or expired');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) {
      const token = uuidv4();

      await this.redis.set(`reset:${token}`, user.id, 1800);

      const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
      await this.emailQueue.add(
        'sendPasswordReset',
        {
          email: user.email,
          token,
          resetLink: `${frontendUrl}/reset-password?token=${token}`,
        },
        STANDARD_QUEUE_OPTIONS,
      );
    }

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const userId = await this.redis.get(`reset:${dto.token}`);

    if (!userId) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token',
      );
    }

    const hashedPassword = await this.hashPassword(dto.new_password);

    // Update the user's password in the database
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete the used token to prevent reuse
    await this.redis.del(`reset:${dto.token}`);

    return { message: 'Password updated successfully.' };
  }

  async signOut(
    userId: string,
    accessToken: string,
    deviceId: string = 'default',
  ) {
    // Invalidate the refresh token session
    await this.redis.del(`rt:${userId}:${deviceId}`);

    // Blacklist the specific access token being used (prevents re-use of this token)
    // Store it for 1 hour (matching JWT_ACCESS_EXPIRATION default)
    await this.redis.set(`bl:${accessToken}`, 'revoked', 3600);
  }

  async updateDriverProfile(userId: string, dto: UpdateDriverProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { driver_profile: true },
    });

    if (!user || user.role !== 'driver') {
      throw new NotFoundException('Driver not found');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Update basic user info
      const userUpdates: { full_name?: string; phone?: string } = {};
      if (dto.full_name) userUpdates.full_name = dto.full_name;
      if (dto.phone) userUpdates.phone = dto.phone;

      if (Object.keys(userUpdates).length > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: userUpdates,
        });
      }

      // Update driver profile info
      return prisma.driver.update({
        where: { user_id: userId },
        data: {
          vehicle_type: dto.vehicle_type,
          vehicle_make: dto.vehicle_make,
          vehicle_model: dto.vehicle_model,
          vehicle_plate: dto.vehicle_plate,
          vehicle_color: dto.vehicle_color,
          license_number: dto.license_number,
        },
      });
    });
  }

  async completeOnboarding(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { is_onboarded: true },
    });
  }

  async joinCompany(userId: string, dto: JoinCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { company_code: dto.company_code.toUpperCase() },
    });

    if (!company) {
      throw new NotFoundException('No company found with that code');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        company_id: company.id,
        is_onboarded: false, // Force re-onboarding for the new fleet
      },
      include: { driver_profile: true },
    });

    // Update driver profile company_id as well
    if (user.driver_profile) {
      await this.prisma.driver.update({
        where: { id: user.driver_profile.id },
        data: { company_id: company.id },
      });
    }

    return this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      email_verified: user.email_verified,
      is_onboarded: false,
      full_name: user.full_name,
    });
  }
}
