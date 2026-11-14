import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';
import { ERROR_MESSAGES } from '../errors/error-messages.constants';
import { NonErrorThrownError } from '../errors/non-error-thrown.error';
import { resolveLanguage } from '../i18n/resolve-language';
import { REQUEST_ID_HEADER } from '../request-id/request-id.constants';
import { resolveRequestId } from '../request-id/resolve-request-id';
import type { ErrorResponseBody } from './error-response-body.interface';
import { HTTP_STATUS_ERROR_CODES } from './http-status-error-codes.constants';

/**
 * Produces every error response: `{ code, message, details?, requestId }`.
 *
 * - AppError: its own code, status and details.
 * - Nest HttpException: the code for its status (HTTP_STATUS_ERROR_CODES), no details;
 *   an unlisted 4xx is BAD_REQUEST. VALIDATION_FAILED comes only from the validation pipe.
 * - Anything else, an HttpException with a status below 400 included (not an error
 *   status): INTERNAL_ERROR, 500, and nothing from the error reaches the body.
 *
 * For a 5xx the original error is set on `response.err`, where the request logger
 * picks it up and logs it, with its stack, on the request's log line. A thrown value
 * that is not an Error is logged as a NonErrorThrownError describing it.
 *
 * When the response has already started (headers sent), the error is set on
 * `response.err` and the response is ended without a body.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request & { id?: unknown }>();
    const response = http.getResponse<Response & { err?: Error }>();

    const error = this.toAppError(exception);
    const logged =
      exception instanceof Error
        ? exception
        : new NonErrorThrownError(exception);
    if (response.headersSent) {
      // Part of a response is already on its way: no error body can follow it. Log the
      // error on the request's line and end the response, so the client sees it cut
      // short instead of waiting.
      response.err = logged;
      if (!response.writableEnded) {
        response.end();
      }
      return;
    }
    if (error.status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      response.err = logged;
    }

    const requestId =
      typeof request.id === 'string'
        ? request.id
        : resolveRequestId(request.headers[REQUEST_ID_HEADER]);
    if (!response.getHeader(REQUEST_ID_HEADER)) {
      response.setHeader(REQUEST_ID_HEADER, requestId);
    }

    const language = resolveLanguage(request.headers['accept-language']);
    const body: ErrorResponseBody = {
      code: error.code,
      message: ERROR_MESSAGES[error.code][language],
      ...(error.details === undefined ? {} : { details: error.details }),
      requestId,
    };
    response.status(error.status).json(body);
  }

  private toAppError(exception: unknown): AppError {
    if (exception instanceof AppError) {
      return exception;
    }
    if (
      exception instanceof HttpException &&
      exception.getStatus() >= Number(HttpStatus.BAD_REQUEST)
    ) {
      const status = exception.getStatus();
      const code =
        HTTP_STATUS_ERROR_CODES[status] ??
        (status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST);
      return new AppError(code, { status, cause: exception });
    }
    return new AppError(ErrorCode.INTERNAL_ERROR, {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      cause: exception,
    });
  }
}
