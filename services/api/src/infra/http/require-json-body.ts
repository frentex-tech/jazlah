import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@common/errors/app-error';
import { ErrorCode } from '@common/errors/error-code.enum';
import { JSON_BODY_TYPES } from './http.constants';

/**
 * Express middleware: refuses a request that carries a body of any type other than
 * JSON with 415 UNSUPPORTED_MEDIA_TYPE. A request without a body passes.
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
  // `req.is` answers null when the request has no body.
  if (req.is([...JSON_BODY_TYPES]) === false) {
    next(new AppError(ErrorCode.UNSUPPORTED_MEDIA_TYPE));
    return;
  }
  next();
}
