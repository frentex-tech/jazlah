import {
  ArgumentsHost,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  MethodNotAllowedException,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';
import { ERROR_MESSAGES } from '../errors/error-messages.constants';
import { NonErrorThrownError } from '../errors/non-error-thrown.error';
import { toFieldErrors } from '../pipes/to-field-errors';
import { AllExceptionsFilter } from './all-exceptions.filter';

function run(
  exception: unknown,
  request: { id?: unknown; headers: Record<string, string> } = {
    id: 'req-1',
    headers: {},
  },
  headersSent = false,
) {
  const captured = {
    status: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    err: undefined as unknown,
    ended: false,
  };
  const response = {
    headersSent,
    writableEnded: false,
    end() {
      captured.ended = true;
      return response;
    },
    set err(value: unknown) {
      captured.err = value;
    },
    status(code: number) {
      captured.status = code;
      return response;
    },
    json(body: unknown) {
      captured.body = body;
      return response;
    },
    getHeader(name: string) {
      return captured.headers[name];
    },
    setHeader(name: string, value: string) {
      captured.headers[name] = value;
    },
  };
  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
  new AllExceptionsFilter().catch(exception, host);
  return captured;
}

describe('AllExceptionsFilter', () => {
  describe('AppError', () => {
    it('uses its own code, status and details', () => {
      const result = run(
        new AppError(ErrorCode.CONFLICT, { details: { slot: 'taken' } }),
      );
      expect(result.status).toBe(HttpStatus.CONFLICT);
      expect(result.body).toEqual({
        code: 'CONFLICT',
        message: ERROR_MESSAGES.CONFLICT.ar,
        details: { slot: 'taken' },
        requestId: 'req-1',
      });
      expect(result.err).toBeUndefined();
    });

    it('honours a status override', () => {
      const result = run(
        new AppError(ErrorCode.NOT_FOUND, { status: HttpStatus.GONE }),
      );
      expect(result.status).toBe(HttpStatus.GONE);
      expect(result.body).toMatchObject({ code: 'NOT_FOUND' });
    });

    it('omits details when there are none', () => {
      expect(run(new AppError(ErrorCode.FORBIDDEN)).body).not.toHaveProperty(
        'details',
      );
    });
  });

  describe('Nest HttpException', () => {
    it.each([
      [new NotFoundException('Cannot GET /x'), 404, 'NOT_FOUND'],
      [new ForbiddenException(), 403, 'FORBIDDEN'],
      [new BadRequestException('bad'), 400, 'BAD_REQUEST'],
      [
        new HttpException('x', HttpStatus.TOO_MANY_REQUESTS),
        429,
        'RATE_LIMITED',
      ],
      [new MethodNotAllowedException(), 405, 'METHOD_NOT_ALLOWED'],
      [new PayloadTooLargeException(), 413, 'PAYLOAD_TOO_LARGE'],
      [new UnsupportedMediaTypeException(), 415, 'UNSUPPORTED_MEDIA_TYPE'],
      [new HttpException('x', HttpStatus.CONFLICT), 409, 'CONFLICT'],
      [new HttpException('x', HttpStatus.UNAUTHORIZED), 401, 'UNAUTHORIZED'],
      // An unlisted 4xx keeps its status and is BAD_REQUEST, never VALIDATION_FAILED.
      [new HttpException('x', HttpStatus.I_AM_A_TEAPOT), 418, 'BAD_REQUEST'],
      [new HttpException('x', HttpStatus.GONE), 410, 'BAD_REQUEST'],
      [new ServiceUnavailableException(), 503, 'INTERNAL_ERROR'],
    ])('maps %p to %p %p without its message', (exception, status, code) => {
      const result = run(exception);
      expect(result.status).toBe(status);
      expect(result.body).toEqual({
        code,
        message: ERROR_MESSAGES[code as ErrorCode].ar,
        requestId: 'req-1',
      });
    });
  });

  describe('validation failure', () => {
    it('returns VALIDATION_FAILED, 400, with each field and its constraints', () => {
      const errors: ValidationError[] = [
        { property: 'name', constraints: { isString: 'x', isNotEmpty: 'y' } },
        { property: 'extra', constraints: { whitelistValidation: 'z' } },
        {
          property: 'address',
          children: [{ property: 'city', constraints: { isString: 'x' } }],
        },
      ];
      const result = run(
        new AppError(ErrorCode.VALIDATION_FAILED, {
          details: toFieldErrors(errors),
        }),
      );
      expect(result.status).toBe(400);
      expect(result.body).toMatchObject({
        code: 'VALIDATION_FAILED',
        details: [
          { field: 'name', constraints: ['isString', 'isNotEmpty'] },
          { field: 'extra', constraints: ['whitelistValidation'] },
          { field: 'address.city', constraints: ['isString'] },
        ],
      });
    });
  });

  describe('anything else', () => {
    it('returns INTERNAL_ERROR, 500, and leaks nothing about the error', () => {
      const error = new TypeError('db password=hunter2 at InternalThing');
      const result = run(error);
      expect(result.status).toBe(500);
      expect(result.body).toEqual({
        code: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.INTERNAL_ERROR.ar,
        requestId: 'req-1',
      });
      const text = JSON.stringify(result.body);
      expect(text).not.toContain('hunter2');
      expect(text).not.toContain('TypeError');
      expect(text).not.toContain('InternalThing');
    });

    it('hands the original error to the request logger', () => {
      const error = new Error('boom');
      expect(run(error).err).toBe(error);
    });

    it('logs a thrown value that is not an Error, describing it', () => {
      const result = run('a string');
      expect(result.body).toMatchObject({ code: 'INTERNAL_ERROR' });
      expect(result.err).toBeInstanceOf(NonErrorThrownError);
      expect((result.err as Error).message).toBe(
        'A value that is not an Error was thrown: string a string',
      );
    });

    it('describes a thrown object by its type and property names only', () => {
      const result = run({ phone: '+966500000123', code: 7 });
      expect((result.err as Error).message).toBe(
        'A value that is not an Error was thrown: Object with properties [phone, code]',
      );
    });

    it('treats an HttpException with a status below 400 as INTERNAL_ERROR, and logs it', () => {
      const exception = new HttpException('moved', HttpStatus.FOUND);
      const result = run(exception);
      expect(result.status).toBe(500);
      expect(result.body).toMatchObject({ code: 'INTERNAL_ERROR' });
      expect(result.err).toBe(exception);
    });
  });

  describe('after the response has started', () => {
    it('records the error for the log and ends the response without a body', () => {
      const error = new Error('stream broke');
      const result = run(error, { id: 'req-3', headers: {} }, true);
      expect(result.err).toBe(error);
      expect(result.ended).toBe(true);
      expect(result.body).toBeUndefined();
      expect(result.status).toBe(0);
    });

    it('records even an error that would be a 4xx', () => {
      const error = new AppError(ErrorCode.NOT_FOUND);
      const result = run(error, { id: 'req-3', headers: {} }, true);
      expect(result.err).toBe(error);
      expect(result.ended).toBe(true);
    });
  });

  describe('language and request id', () => {
    it('answers in English when Accept-Language prefers it', () => {
      const result = run(new AppError(ErrorCode.NOT_FOUND), {
        id: 'req-2',
        headers: { 'accept-language': 'en-US,en;q=0.9' },
      });
      expect(result.body).toMatchObject({
        message: ERROR_MESSAGES.NOT_FOUND.en,
      });
    });

    it('uses the request id the logger assigned and returns it in the header', () => {
      const result = run(new AppError(ErrorCode.NOT_FOUND));
      expect(result.body).toMatchObject({ requestId: 'req-1' });
      expect(result.headers['x-request-id']).toBe('req-1');
    });

    it('resolves an id from the header when the logger did not assign one', () => {
      const result = run(new AppError(ErrorCode.NOT_FOUND), {
        headers: { 'x-request-id': 'from-header' },
      });
      expect(result.body).toMatchObject({ requestId: 'from-header' });
      expect(result.headers['x-request-id']).toBe('from-header');
    });
  });
});
