import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { JwtPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const authHeader = req.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';

    // 1. Blacklist check: Ensure this specific token hasn't been revoked
    const isRedeemed = await this.redis.get(`bl:${token}`);
    if (isRedeemed) {
      console.error(
        `JWT Validation Failed: Token has been revoked for user ${payload.sub}`,
      );
      throw new UnauthorizedException('Token has been revoked');
    }

    // 2. Soft session check: If Redis session exists, it MUST be valid.
    // If it doesn't exist (e.g. Redis was cleared), we fall back to standard JWT verification.
    const deviceId = payload.device_id || 'default';
    const sessionExists = await this.redis.get(`rt:${payload.sub}:${deviceId}`);

    // We only throw if the session exists but is invalid/revoked?
    // Actually, in this specific architecture, the presence of the key IS the session.
    // To be more resilient, we only enforce this if we are SURE Redis should have it.
    // For now, let's just log a warning and let it pass if Redis is empty but the JWT is valid.
    // This handles the "Redis cleared/restarted" case.
    if (!sessionExists) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { company: true, driver_profile: true },
    });

    if (!user || user.company_id !== payload.company_id) {
      throw new UnauthorizedException('User not found or misconfigured token');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    if (
      user.company.subscription_locked &&
      !req.path.includes('/dashboard/billing')
    ) {
      throw new ForbiddenException(
        'Your workspace is locked due to an expired trial or past-due payment. Please upgrade to continue.',
      );
    }

    if (user.role === 'driver') {
      if (!user.driver_profile) {
        throw new UnauthorizedException('Driver profile not found');
      }
      if (!user.driver_profile.is_active) {
        throw new UnauthorizedException('This account has been deactivated.');
      }
    }

    this.prisma.user
      .update({
        where: { id: user.id },
        data: { last_seen_at: new Date() },
      })
      .catch(() => {});

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      company_code: user.company.company_code,
      device_id: deviceId,
    };
  }
}
