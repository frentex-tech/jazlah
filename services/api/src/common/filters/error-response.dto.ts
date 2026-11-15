import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ErrorCode } from '../errors/error-code.enum';
import { FieldErrorDto } from './field-error.dto';
import type { ErrorResponseBody } from './error-response-body.interface';

/**
 * The documented shape of every error response (ErrorResponseBody). Endpoints refer to
 * it through `@ApiErrorResponses(...)`, never by declaring a schema of their own.
 */
@ApiExtraModels(FieldErrorDto)
export class ErrorResponseDto implements ErrorResponseBody {
  @ApiProperty({
    description:
      'Stable error code. Clients branch on it; it is never renamed or reused.',
    enum: ErrorCode,
    enumName: 'ErrorCode',
    example: ErrorCode.NOT_FOUND,
  })
  readonly code!: ErrorCode;

  @ApiProperty({
    description:
      'Message for a person, in Arabic unless Accept-Language prefers English. Never branch on it.',
    example: 'The requested resource was not found.',
  })
  readonly message!: string;

  @ApiProperty({
    required: false,
    description:
      'More about the error. For VALIDATION_FAILED, the list of invalid fields; otherwise an object whose fields depend on the code.',
    oneOf: [
      { type: 'array', items: { $ref: getSchemaPath(FieldErrorDto) } },
      { type: 'object', additionalProperties: true },
    ],
  })
  readonly details?: unknown;

  @ApiProperty({
    description:
      'Id of the request, also in the x-request-id response header. Quote it when reporting a problem.',
    example: '3f2b8c1e-7d4a-4b6f-9a2e-5c8d1f0e6b7a',
  })
  readonly requestId!: string;
}
