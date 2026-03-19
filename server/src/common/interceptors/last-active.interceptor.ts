import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class LastActiveInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as unknown as { user: User }).user;

    return next.handle().pipe(
      tap(() => {
        if (user && user.role === 'driver') {
          this.updateLastActive(user.id).catch((err) =>
            console.error('Failed to update last_active_at:', err),
          );
        }
      }),
    );
  }

  private async updateLastActive(userId: string): Promise<void> {
    try {
      await this.prisma.driver.updateMany({
        where: { user_id: userId },
        data: { last_active_at: new Date() },
      });
    } catch (err) {
      console.error('Failed to update last_active_at database record:', err);
    }
  }
}
