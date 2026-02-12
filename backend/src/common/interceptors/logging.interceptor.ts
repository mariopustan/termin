import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const correlationId =
      (request.headers['x-correlation-id'] as string) || uuidv4();

    request.headers['x-correlation-id'] = correlationId;

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const response = context.switchToHttp().getResponse();
        this.logger.log(
          JSON.stringify({
            correlationId,
            method,
            url,
            ip,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
          }),
        );
      }),
    );
  }
}
