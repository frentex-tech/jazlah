import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorCode } from '../errors/error-code.enum';
import { ERROR_STATUSES } from '../errors/error-statuses.constants';
import { ErrorResponseDto } from '../filters/error-response.dto';

/**
 * Documents the error responses of an endpoint (or of every endpoint of a controller),
 * all with the one shared error schema, ErrorResponseDto.
 *
 * Pass the codes the endpoint can return. Each is documented under its default status
 * (ERROR_STATUSES); codes that share a status are listed together. INTERNAL_ERROR (500)
 * is always added, since any endpoint can fail unexpectedly.
 *
 * @example @ApiErrorResponses(ErrorCode.VALIDATION_FAILED, ErrorCode.RATE_LIMITED)
 */
export function ApiErrorResponses(
  ...codes: ErrorCode[]
): MethodDecorator & ClassDecorator {
  const codesByStatus = new Map<number, ErrorCode[]>();
  for (const code of new Set([...codes, ErrorCode.INTERNAL_ERROR])) {
    const status = ERROR_STATUSES[code];
    codesByStatus.set(status, [...(codesByStatus.get(status) ?? []), code]);
  }
  return applyDecorators(
    ...[...codesByStatus.entries()]
      .sort(([first], [second]) => first - second)
      .map(([status, statusCodes]) =>
        ApiResponse({
          status,
          description: `Error. code: ${statusCodes.join(', ')}.`,
          type: ErrorResponseDto,
        }),
      ),
  );
}
