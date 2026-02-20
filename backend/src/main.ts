import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { validationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  const corsOrigin = configService.get<string>(
    'app.corsOrigin',
    'https://termin.demo-itw.de',
  );

  app.use(helmet());

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-Correlation-Id', 'X-API-Key', 'Authorization'],
    maxAge: 3600,
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/ready', 'health/live'],
  });

  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
  console.log(`SalesFunnel API running on port ${port}`);
}
bootstrap();
