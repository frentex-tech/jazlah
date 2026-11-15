import { Writable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { pino, type Logger } from 'pino';
import type { Options } from 'pino-http';
import type { AppConfig } from '@config/app-config.type';
import { createLoggerParams } from './create-logger-params';

function optionsFor(
  nodeEnv: AppConfig['nodeEnv'],
  prettyInstalled = true,
): Options {
  const params = createLoggerParams(
    { nodeEnv, port: 3000, shutdownDeadlineMs: 28_000 },
    { level: 'debug' },
    () => prettyInstalled,
  );
  return params.pinoHttp as Options;
}

function captureLines(options: Options): {
  logger: Logger;
  lines: Record<string, unknown>[];
} {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, done) {
      lines.push(JSON.parse(chunk.toString()) as Record<string, unknown>);
      done();
    },
  });
  const { level, serializers, formatters } = options;
  return { logger: pino({ level, serializers, formatters }, stream), lines };
}

describe('createLoggerParams', () => {
  it('uses the configured level, silent in test', () => {
    expect(optionsFor('production').level).toBe('debug');
    expect(optionsFor('test').level).toBe('silent');
  });

  it('prints readable lines in development and JSON in production', () => {
    expect(optionsFor('development').transport).toMatchObject({
      target: 'pino-pretty',
    });
    expect(optionsFor('production').transport).toBeUndefined();
  });

  it('falls back to JSON in development when pino-pretty cannot be resolved', () => {
    expect(optionsFor('development', false).transport).toBeUndefined();
  });

  it('never uses pino-pretty outside development, even when installed', () => {
    expect(optionsFor('production', true).transport).toBeUndefined();
    expect(optionsFor('test', true).transport).toBeUndefined();
  });

  it('resolves pino-pretty by default when it is installed', () => {
    const params = createLoggerParams(
      { nodeEnv: 'development', port: 3000, shutdownDeadlineMs: 28_000 },
      { level: 'info' },
    );
    expect((params.pinoHttp as Options).transport).toMatchObject({
      target: 'pino-pretty',
    });
  });

  it.each([
    [200, undefined, 'info'],
    [404, undefined, 'warn'],
    [409, undefined, 'warn'],
    [500, undefined, 'error'],
    [503, undefined, 'error'],
    [200, new Error('x'), 'error'],
  ])('logs status %p (error %p) at %p', (statusCode, error, level) => {
    const { customLogLevel } = optionsFor('production');
    const res = { statusCode } as ServerResponse;
    expect(customLogLevel?.({} as IncomingMessage, res, error)).toBe(level);
  });

  it('reuses a safe incoming request id and returns it in the response header', () => {
    const { genReqId } = optionsFor('production');
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (name: string, value: string) => {
        headers[name] = value;
      },
    } as unknown as ServerResponse;
    const req = {
      headers: { 'x-request-id': 'abc-123' },
    } as unknown as IncomingMessage;
    expect(genReqId?.(req, res)).toBe('abc-123');
    expect(headers['x-request-id']).toBe('abc-123');
  });

  it('is not silent in test when a destination captures the lines', () => {
    const params = createLoggerParams(
      { nodeEnv: 'test', port: 3000, shutdownDeadlineMs: 28_000 },
      { level: 'info' },
      () => false,
      { write: () => undefined },
    );
    const [options] = params.pinoHttp as [Options, unknown];
    expect(options.level).toBe('info');
  });

  it('logs the path without the query, req.ip and only allowlisted request headers', () => {
    const { logger, lines } = captureLines(optionsFor('production'));
    const raw = {
      method: 'GET',
      originalUrl: '/v1/health?token=SECRET123',
      ip: '203.0.113.7',
      headers: {
        authorization: 'Bearer abc',
        cookie: 'sid=1',
        'x-api-key': 'k',
        'proxy-authorization': 'p',
        accept: '*/*',
        'user-agent': 'ua',
      },
    };
    logger.info({ req: { id: 'r1', raw } });
    expect(lines[0].req).toEqual({
      id: 'r1',
      method: 'GET',
      url: '/v1/health',
      ip: '203.0.113.7',
      headers: { accept: '*/*', 'user-agent': 'ua' },
    });
  });

  it('logs only allowlisted response headers', () => {
    const { logger, lines } = captureLines(optionsFor('production'));
    logger.info({
      res: {
        statusCode: 200,
        headers: { 'set-cookie': ['a=1'], 'x-request-id': 'r1' },
      },
    });
    expect(lines[0].res).toEqual({
      statusCode: 200,
      headers: { 'x-request-id': 'r1' },
    });
  });

  it('redacts secret-like fields at any depth, whatever their case', () => {
    const { logger, lines } = captureLines(optionsFor('production'));
    logger.info({
      password: 'p0',
      a: {
        accessToken: 't1',
        b: {
          otpCode: 'o2',
          c: { clientSecret: 's3', d: { e: { f: { newPassword: 'p6' } } } },
        },
      },
      list: [{ refresh_token: 't7', Authorization: 'Bearer x8' }],
      apiKey: 'k9',
      footprint: 'visible',
      keep: 'visible',
    });
    const text = JSON.stringify(lines[0]);
    for (const value of [
      'p0',
      't1',
      'o2',
      's3',
      'p6',
      't7',
      'Bearer x8',
      'k9',
    ]) {
      expect(text).not.toContain(`"${value}"`);
    }
    expect(text).toContain('"keep":"visible"');
    expect(text).toContain('"footprint":"visible"');
  });

  it('logs only name, message, code, stack and cause of an error', () => {
    const { logger, lines } = captureLines(optionsFor('production'));
    const error = Object.assign(new Error('WRONGPASS invalid'), {
      command: { name: 'hello', args: ['3', 'AUTH', 'user', 'Sup3rSecret'] },
      code: 'WRONGPASS',
      cause: Object.assign(new Error('row'), {
        meta: { detail: 'Failing row contains (+966500000000)' },
      }),
    });
    logger.error({ err: error }, 'failed');
    const text = JSON.stringify(lines[0]);
    expect(text).not.toContain('Sup3rSecret');
    expect(text).not.toContain('+966500000000');
    expect(lines[0]).toMatchObject({
      err: {
        type: 'Error',
        message: 'WRONGPASS invalid',
        code: 'WRONGPASS',
        cause: { type: 'Error', message: 'row' },
      },
    });
  });
});
