import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const reqId = uuidv4();
    request.headers['x-request-id'] = reqId;
    response.setHeader('X-Request-Id', reqId);

    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const duration = Date.now() - start;
          this.logger.log(
            `[${reqId}] ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip} - ${userAgent}`,
          );
        },
        error: (err: unknown) => {
          const errorResponse = err as { status?: number; statusCode?: number };
          const statusCode =
            errorResponse?.status || errorResponse?.statusCode || 500;
          const duration = Date.now() - start;
          this.logger.error(
            `[${reqId}] ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip} - ${userAgent}`,
          );
        },
      }),
    );
  }
}
