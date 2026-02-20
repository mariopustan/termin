import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

/**
 * Transforms Fonio's `values` array format into named properties.
 *
 * Fonio sends dynamic parameters as:
 *   { "consentGiven": true, "values": ["Peter", "Lustig", "EKVM", "a@b.de", "+49...", "Portale", "2026-..."] }
 *
 * This interceptor maps the ordered values to the expected DTO fields
 * and normalizes productInterest to the enum value.
 */
@Injectable()
export class FonioBodyTransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FonioBodyTransformInterceptor.name);

  private readonly PRODUCT_INTEREST_MAP: Record<string, string> = {
    enterprise_api: 'enterprise_api',
    'enterprise api': 'enterprise_api',
    hr_payroll_integration: 'hr_payroll_integration',
    'hr & payroll integration': 'hr_payroll_integration',
    'hr payroll integration': 'hr_payroll_integration',
    portale: 'portale',
    portal: 'portale',
    payroll_scanner: 'payroll_scanner',
    'payroll scanner': 'payroll_scanner',
    'gehaltsabrechnungs-scanner': 'payroll_scanner',
    ai_act_training: 'ai_act_training',
    'ai act schulung': 'ai_act_training',
    'ai act training': 'ai_act_training',
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.body?.values && Array.isArray(request.body.values)) {
      const values = request.body.values as string[];
      this.logger.debug(`Fonio values array received: ${JSON.stringify(values)}`);

      const transformed: Record<string, unknown> = {
        firstName: values[0],
        lastName: values[1],
        companyName: values[2],
        email: values[3],
        phone: values[4],
        productInterest: values[5],
        slotStart: values[6],
      };

      // Preserve fixed parameters (e.g. consentGiven)
      for (const key of Object.keys(request.body)) {
        if (key !== 'values' && !(key in transformed)) {
          transformed[key] = request.body[key];
        }
      }

      request.body = transformed;
    }

    // Normalize productInterest to enum value
    if (request.body?.productInterest && typeof request.body.productInterest === 'string') {
      const normalized = this.PRODUCT_INTEREST_MAP[request.body.productInterest.toLowerCase()];
      if (normalized) {
        request.body.productInterest = normalized;
      }
    }

    return next.handle();
  }
}
