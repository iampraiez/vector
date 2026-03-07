import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

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
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const token = req.get('Authorization').replace('Bearer ', '');

    // 1. Blacklist check: Ensure this specific token hasn't been revoked
    const isRedeemed = await this.redis.get(`bl:${token}`);
    if (isRedeemed) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // 2. Strict token check: Ensure the user has an active session in Redis
    const deviceId = payload.device_id || 'default';
    const sessionExists = await this.redis.get(`rt:${payload.sub}:${deviceId}`);
    if (!sessionExists) {
      throw new UnauthorizedException('Session has expired or been revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { company: true },
    });

    if (!user || user.company_id !== payload.company_id) {
      throw new UnauthorizedException('User not found or misconfigured token');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    this.prisma.user.update({
      where: { id: user.id },
      data: { last_seen_at: new Date() },
    }).catch(() => {});

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
