import { Injectable, ValidationPipe } from '@nestjs/common';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';
import { toFieldErrors } from './to-field-errors';

/**
 * The global validation pipe. Strips nothing silently: an unknown property is
 * rejected (`whitelistValidation`), and every failure becomes VALIDATION_FAILED
 * with one `details` entry per invalid field.
 */
@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new AppError(ErrorCode.VALIDATION_FAILED, {
          details: toFieldErrors(errors),
        }),
    });
  }
}
