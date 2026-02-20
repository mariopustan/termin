import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const apiKey = this.configService.get<string>('apiKey.key');

    if (!apiKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const origin = request.headers['origin'] as string | undefined;
    const corsOrigin = this.configService.get<string>('app.corsOrigin');

    if (origin && corsOrigin && origin === corsOrigin) {
      return true;
    }

    const providedKey = request.headers['x-api-key'] as string | undefined;

    if (!providedKey) {
      this.logger.warn(
        `Unauthorized request without API key: ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('API-Key fehlt. Bitte X-API-Key Header mitsenden.');
    }

    if (providedKey !== apiKey) {
      this.logger.warn(
        `Invalid API key provided: ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('Ungültiger API-Key.');
    }

    return true;
  }
}
