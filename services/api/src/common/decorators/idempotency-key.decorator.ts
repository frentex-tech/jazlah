import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';

/** The header, as clients spell it and as the validation error names it. */
const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';

/**
 * The `Idempotency-Key` header of the request, required: `place(@IdempotencyKey() key: string)`.
 * A UUID the client makes once per attempt and sends again on a retry of that attempt.
 * Missing, repeated or not a UUID: VALIDATION_FAILED with `details[0].field`
 * `Idempotency-Key`. Returned lower case, so one key is one key whatever its case.
 *
 * Only the header is checked here. Keeping the key and comparing the body is the use
 * case's (`IdempotencyRunner` and `hashRequestBody`); the key belongs to one customer,
 * so a use case keys on the user too.
 */
export const IdempotencyKey = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const { headers } = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const value = headers[IDEMPOTENCY_KEY_HEADER.toLowerCase()];
    if (typeof value !== 'string' || !isUUID(value)) {
      throw new AppError(ErrorCode.VALIDATION_FAILED, {
        details: [{ field: IDEMPOTENCY_KEY_HEADER, constraints: ['isUuid'] }],
      });
    }
    return value.toLowerCase();
  },
);
