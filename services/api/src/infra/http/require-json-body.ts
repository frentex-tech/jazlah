import type { IncomingHttpHeaders } from 'node:http';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { JSON_BODY_TYPES } from './http.constants';

/**
 * Express middleware: refuses a request that carries a body of any type other than
 * JSON with 415 UNSUPPORTED_MEDIA_TYPE. A request without a body passes, whatever its
 * Content-Type (or none).
 *
 * Why: the API reads only JSON bodies. Without this, a form or text body would reach
 * the validation pipe empty and be reported as VALIDATION_FAILED, and a form body is
 * also what a cross-site page can POST without a CORS preflight. A route that needs
 * another type later (a webhook signed over its raw body) gets its own parser and an
 * exemption here, recorded in `.claude/DECISIONS.md`.
 */
export function requireJsonBody(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // `req.is` answers the matching type, false for another type, null for no body.
  if (
    hasBody(req.headers) &&
    typeof req.is([...JSON_BODY_TYPES]) !== 'string'
  ) {
    next(new AppError(ErrorCode.UNSUPPORTED_MEDIA_TYPE));
    return;
  }
  next();
}

/**
 * Whether the request carries a body. `req.is` (type-is) counts `Content-Length: 0` as
 * a body, so a bodyless POST without a Content-Type, which Node's HTTP client and
 * browsers send, would be refused. A chunked body counts even if it turns out empty:
 * its length is unknown until it is read.
 */
function hasBody(headers: IncomingHttpHeaders): boolean {
  if (headers['transfer-encoding'] !== undefined) {
    return true;
  }
  const length = headers['content-length'];
  return length !== undefined && Number(length) > 0;
}
