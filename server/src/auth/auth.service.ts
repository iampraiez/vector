import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
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
} from './dto/auth.dto';
import { JwtPayload, UserWithCompany } from './interfaces/auth.interface';

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
    user: { id: string; email: string; role: string; company_id: string },
    device_id: string = 'default',
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      device_id,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync<JwtPayload>(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRATION',
          '1h',
        ) as any,
      }),
      this.jwtService.signAsync<JwtPayload>(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION',
          '7d',
        ) as any,
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

  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { company: true },
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
      await this.emailQueue.add('sendVerification', {
        email: user.email,
        token,
      });

      throw new UnauthorizedException(
        'Please verify your email address. A new verification code has been sent to your inbox.',
      );
    }

    return this.generateTokens(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
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

    await this.emailQueue.add('sendVerification', { email: user.email, token });

    return {
      message: 'Account created. Please verify your email.',
      user_id: user.id,
      company: {
        id: company.id,
        name: company.name,
        company_code: company.company_code,
      },
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
    await this.emailQueue.add('sendVerification', {
      email: result.user.email,
      token,
    });

    return {
      message: 'Company and account created. Please verify your email.',
      user_id: result.user.id,
      company: {
        id: result.company.id,
        name: result.company.name,
        company_code: result.company.company_code,
      },
      checkout_url: 'https://paystack.com/pay/stub', // Paystack stub
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const storedToken = await this.redis.get(`verify:${dto.email}`);
    if (!storedToken || storedToken !== dto.token) {
      throw new UnauthorizedException('Token is invalid or expired.');
    }

    await this.redis.del(`verify:${dto.email}`);

    // Mark the user's email as verified in the database
    await this.prisma.user.update({
      where: { email: dto.email },
      data: { email_verified: true },
    });

    return { message: 'Email verified successfully.' };
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
      if (!storedHash) throw new UnauthorizedException('Invalid refresh token');

      const isMatch = await bcrypt.compare(dto.refresh_token, storedHash);
      if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

      const user = (await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { company: true },
      })) as UserWithCompany | null;

      if (!user) throw new UnauthorizedException('User not found');

      return this.generateTokens(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          company_id: user.company_id,
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

      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3000',
      );
      await this.emailQueue.add('sendPasswordReset', {
        email: user.email,
        token,
        resetLink: `${frontendUrl}/reset-password?token=${token}`,
      });
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
}
