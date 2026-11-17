import {
  type ArgumentMetadata,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';
import { findNulCharacterFields } from './find-nul-character-fields';
import { toFieldErrors } from './to-field-errors';

/** The constraint a field holding a NUL character fails. */
const NO_NUL_CONSTRAINT = 'hasNoNulCharacter';

/** The request inputs the pipe checks: what the client sends. */
const CLIENT_INPUTS: ReadonlySet<ArgumentMetadata['type']> = new Set([
  'body',
  'query',
  'param',
]);

/**
 * The global validation pipe. Strips nothing silently: an unknown property is
 * rejected (`whitelistValidation`), and every failure becomes VALIDATION_FAILED
 * with one `details` entry per invalid field.
 *
 * Before any DTO is validated, a NUL character (`\u0000`) in any string of the body,
 * the query or a path parameter, at any depth, is refused as VALIDATION_FAILED with the
 * constraint `hasNoNulCharacter` on each such field: PostgreSQL cannot store one, so it
 * would otherwise fail in a query as a 500. This holds for every endpoint, with or
 * without a DTO; values from custom decorators (the signed-in user) are not input.
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

  override async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (CLIENT_INPUTS.has(metadata.type)) {
      const fields = findNulCharacterFields(value, metadata.data ?? '');
      if (fields.length > 0) {
        throw new AppError(ErrorCode.VALIDATION_FAILED, {
          details: fields.map((field) => ({
            field,
            constraints: [NO_NUL_CONSTRAINT],
          })),
        });
      }
    }
    return (await super.transform(value, metadata)) as unknown;
  }
}
