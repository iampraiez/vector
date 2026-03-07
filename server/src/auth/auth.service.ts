import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bull';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { SignInDto, SignUpDriverDto, SignUpFleetDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto/auth.dto';

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

  private async generateTokens(user: { id: string; email: string; role: string; company_id: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role, company_id: user.company_id };
    
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '1h'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    // Store refresh token hash in Redis
    const tokenHash = await bcrypt.hash(refresh_token, 10);
    const ttlDays = parseInt(this.configService.get('JWT_REFRESH_EXPIRATION', '7d').replace('d', ''), 10);
    await this.redis.set(`rt:${user.id}`, tokenHash, ttlDays * 24 * 60 * 60);

    return { access_token, refresh_token, expires_in: 3600, user };
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

    return this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    });
  }

  async signUpDriver(dto: SignUpDriverDto) {
    const company = await this.prisma.company.findUnique({
      where: { company_code: dto.company_code },
    });

    if (!company) {
      throw new NotFoundException('No company found with that code');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
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
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
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
    await this.emailQueue.add('sendVerification', { email: result.user.email, token });

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
    // In a full implementation, you'd likely set an `email_verified` flag on the User here if it existed

    return { message: 'Email verified successfully.' };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refresh_token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const storedHash = await this.redis.get(`rt:${payload.sub}`);
      if (!storedHash) throw new UnauthorizedException('Invalid refresh token');

      const isMatch = await bcrypt.compare(dto.refresh_token, storedHash);
      if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { company: true },
      });

      if (!user) throw new UnauthorizedException('User not found');

      return this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      });
    } catch (e) {
      throw new UnauthorizedException('Token invalid or expired');
    }
  }

  async signOut(userId: string) {
    await this.redis.del(`rt:${userId}`);
  }
}
