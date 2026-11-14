import { inspect } from 'node:util';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { PrismaService } from '@infra/database/prisma.service';
import { createHttpApp } from './support/create-http-app';
import { LogCapture } from './support/log-capture';
import { LogProbeController } from './support/log-probe.controller';
import { PRISMA_MESSAGE_OMITTED } from '@infra/logger/prisma-error-logging.constants';
import { DbContext } from '@infra/database/db-context';
import {
  LOG_PROBE_AFTER_HEADERS_MESSAGE,
  LOG_PROBE_ENTITY,
  LOG_PROBE_PHONE,
  LOG_PROBE_THROWN_KEY,
} from './support/log-probe.constants';

/** Prints a captured line, so the run shows what was actually logged. */
function show(label: string, line: Record<string, unknown>): void {
  process.stdout.write(`${label}:\n  ${JSON.stringify(line)}\n`);
}

// Redis errors are checked in redis-logging.e2e-spec.ts: nestjs-pino keeps one root
// logger per process (per Jest test file), so each logging application needs its own file.
describe('Secrets and personal data in request logs (e2e)', () => {
  describe('request logs', () => {
    let app: NestExpressApplication;
    let capture: LogCapture;

    beforeAll(async () => {
      capture = new LogCapture();
      app = await createHttpApp({
        controllers: [LogProbeController],
        logDestination: capture.stream,
      });
    });

    afterAll(async () => {
      await app
        .get(PrismaService)
        .auditLog.deleteMany({ where: { entity: LOG_PROBE_ENTITY } });
      await app.close();
    });

    /** The request log line of the next request to `path`. */
    function nextRequestLine(path: string) {
      const before = capture.lines.length;
      return capture.waitFor(
        (line) =>
          capture.lines.indexOf(line) >= before &&
          Reflect.get(Object(line.req), 'url') === path &&
          typeof line.res === 'object',
      );
    }

    /** The request log line carrying the request id `id`. */
    function lineWithId(id: string) {
      return capture.waitFor(
        (line) =>
          Reflect.get(Object(line.req), 'id') === id &&
          typeof line.res === 'object',
      );
    }

    async function loggedLine(path: string, status: number) {
      const line = nextRequestLine(path.split('?')[0]);
      await request(app.getHttpServer()).get(path).expect(status);
      return line;
    }

    it('log a unique violation on a row holding a phone number without the phone', async () => {
      const line = await loggedLine('/v1/log-probe/unique-violation', 500);
      show('unique violation', line);
      expect(line).toMatchObject({ err: { code: 'P2002' } });
      expect(JSON.stringify(line)).not.toContain(LOG_PROBE_PHONE);
    });

    it('log a check violation whose database error holds the phone, without the phone', async () => {
      // Precondition: the database error itself carries the failing row.
      const raw = await app
        .get(PrismaService)
        .$transaction(async (tx) => {
          await tx.$executeRaw`CREATE TEMP TABLE e2e_log_pre (phone text CHECK (length(phone) < 5)) ON COMMIT DROP`;
          await tx.$executeRaw`INSERT INTO e2e_log_pre (phone) VALUES (${LOG_PROBE_PHONE})`;
        })
        .then(
          () => undefined,
          (error: unknown) => error,
        );
      expect(inspect(raw, { depth: 6 })).toContain(LOG_PROBE_PHONE);

      const line = await loggedLine('/v1/log-probe/check-violation', 500);
      show('check violation', line);
      expect(line).toMatchObject({ err: { code: 'P2010' } });
      expect(JSON.stringify(line)).not.toContain(LOG_PROBE_PHONE);
    });

    it('log the path of a request without its query string', async () => {
      const line = await loggedLine(
        '/v1/health?token=SECRET-e2e-123&otp=4321',
        200,
      );
      show('query string', line);
      expect(line).toMatchObject({ req: { url: '/v1/health' } });
      expect(JSON.stringify(line)).not.toContain('SECRET-e2e-123');
      expect(JSON.stringify(line)).not.toContain('4321');
    });

    it('log the client address from req.ip and only allowlisted headers', async () => {
      const next = nextRequestLine('/v1/health');
      await request(app.getHttpServer())
        .get('/v1/health')
        .set('Authorization', 'Bearer e2e-token')
        .set('x-api-key', 'e2e-key')
        .expect(200);
      const line = await next;
      show('headers and address', line);
      // Express's req.ip (the test client connects from the loopback address).
      expect(Object(line.req)).toMatchObject({ ip: '127.0.0.1' });
      expect(JSON.stringify(line)).not.toContain('e2e-token');
      expect(JSON.stringify(line)).not.toContain('e2e-key');
    });

    it('log a Prisma validation error without its message, which holds the arguments', async () => {
      // Precondition: Prisma's own message prints the query arguments, phone included.
      const raw = await app
        .get(DbContext)
        .client.auditLog.create({
          data: {
            action: 'e2e.log-probe.created',
            entity: LOG_PROBE_ENTITY,
            entityId: '00000000-0000-4000-8000-000000000001',
            ...{ phone: LOG_PROBE_PHONE },
          },
        })
        .then(
          () => undefined,
          (error: unknown) => error,
        );
      expect(raw).toBeInstanceOf(Error);
      expect((raw as Error).name).toBe('PrismaClientValidationError');
      expect((raw as Error).message).toContain(LOG_PROBE_PHONE);

      const line = await loggedLine('/v1/log-probe/validation-error', 500);
      show('prisma validation error', line);
      expect(line).toMatchObject({
        err: {
          type: 'PrismaClientValidationError',
          message: PRISMA_MESSAGE_OMITTED,
        },
      });
      expect(JSON.stringify(line)).not.toContain(LOG_PROBE_PHONE);
    });

    it('log a malformed JSON body with its request id', async () => {
      const id = 'e2e-malformed-json-1';
      const next = lineWithId(id);
      const res = await request(app.getHttpServer())
        .post('/v1/log-probe/anything')
        .set('x-request-id', id)
        .set('Content-Type', 'application/json')
        .send('{"broken": ')
        .expect(400);
      expect(res.headers['x-request-id']).toBe(id);
      const line = await next;
      show('malformed JSON', line);
      expect(line).toMatchObject({
        req: { id, method: 'POST', url: '/v1/log-probe/anything' },
        res: { statusCode: 400 },
      });
    });

    it('log an oversized body and an unsupported body type with their request ids', async () => {
      const big = 'e2e-oversized-body-1';
      const nextBig = lineWithId(big);
      await request(app.getHttpServer())
        .post('/v1/log-probe/anything')
        .set('x-request-id', big)
        .send({ text: 'x'.repeat(200_000) })
        .expect(413);
      expect(await nextBig).toMatchObject({ res: { statusCode: 413 } });

      const form = 'e2e-form-body-1';
      const nextForm = lineWithId(form);
      await request(app.getHttpServer())
        .post('/v1/log-probe/anything')
        .set('x-request-id', form)
        .type('form')
        .send({ a: '1' })
        .expect(415);
      expect(await nextForm).toMatchObject({ res: { statusCode: 415 } });
    });

    it('log a request to a path outside the /v1 prefix', async () => {
      const id = 'e2e-outside-prefix-1';
      const next = lineWithId(id);
      await request(app.getHttpServer())
        .get('/wp-login.php')
        .set('x-request-id', id)
        .expect(404);
      expect(await next).toMatchObject({ req: { url: '/wp-login.php' } });
    });

    it('log a thrown object that is not an Error by its property names, without its values', async () => {
      const line = await loggedLine('/v1/log-probe/thrown-value', 500);
      show('thrown value', line);
      expect(JSON.stringify(line.err)).toContain(LOG_PROBE_THROWN_KEY);
      expect(JSON.stringify(line)).not.toContain(LOG_PROBE_PHONE);
    });

    it('log an error thrown after the headers were sent, and end the response', async () => {
      const line = loggedLine('/v1/log-probe/after-headers', 200);
      const done = await line;
      show('after headers', done);
      expect(done).toMatchObject({
        res: { statusCode: 200 },
        err: { message: LOG_PROBE_AFTER_HEADERS_MESSAGE },
      });
    });

    it('answer an HttpException below 400 as 500 INTERNAL_ERROR and log it', async () => {
      const next = nextRequestLine('/v1/log-probe/status-below-400');
      const res = await request(app.getHttpServer())
        .get('/v1/log-probe/status-below-400')
        .expect(500);
      expect(res.body).toMatchObject({ code: 'INTERNAL_ERROR' });
      expect(await next).toMatchObject({ err: { type: 'HttpException' } });
    });
  });
});
