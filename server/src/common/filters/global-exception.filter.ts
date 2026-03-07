import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'internal_server_error';
    let message = 'An unexpected error occurred';
    let details = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      error = this.getErrorSlug(status);
      message = res.message || exception.message;
      details = res.error ? { original_error: res.error } : {};
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        error = 'conflict';
        message = 'A record with this identifier already exists.';
        details = { target: exception.meta?.target };
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        error = 'not_found';
        message = 'Resource not found.';
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = process.env.NODE_ENV === 'development' ? exception.message : message;
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(status).json({
      error,
      message,
      details,
    });
  }

  private getErrorSlug(status: number): string {
    switch (status) {
      case 400: return 'bad_request';
      case 401: return 'unauthenticated';
      case 403: return 'forbidden';
      case 404: return 'not_found';
      case 409: return 'conflict';
      case 422: return 'unprocessable';
      case 429: return 'rate_limited';
      default: return 'internal_server_error';
    }
  }
}
