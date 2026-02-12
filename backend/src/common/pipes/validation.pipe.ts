import {
  ValidationPipe as NestValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';

export const validationPipe = new NestValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: false,
  },
  exceptionFactory: (errors: ValidationError[]) => {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints || {}).map((msg) => msg),
    );
    return new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Validierungsfehler',
      details: messages,
    });
  },
});
