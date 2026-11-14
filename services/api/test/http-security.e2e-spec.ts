import { request as httpRequest } from 'node:http';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { buildHttpConfig } from '@config/build-http-config';
import { loadEnv } from '@config/load-env';
import { createHttpApp } from './support/create-http-app';
import { ProbeController } from './support/probe.controller';

const ALLOWED = 'https://app.example.com';
const OTHER = 'https://other.example.net';

describe('HTTP security baseline (e2e)', () => {
  let app: NestExpressApplication;

  afterEach(async () => {
    await app.close();
  });

  describe('headers', () => {
    beforeEach(async () => {
      app = await createHttpApp({ controllers: [ProbeController] });
    });

    it.each(['/v1/health', '/v1/does-not-exist', '/docs', '/docs-json'])(
      '%s carries the helmet headers and no x-powered-by',
      async (url) => {
        const res = await request(app.getHttpServer()).get(url);
        expect(res.headers['content-security-policy']).toContain(
          "default-src 'self'",
        );
        expect(res.headers['strict-transport-security']).toMatch(/max-age=/);
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
        expect(res.headers['cross-origin-opener-policy']).toBe('same-origin');
        expect(res.headers['referrer-policy']).toBe('no-referrer');
        expect(res.headers['x-powered-by']).toBeUndefined();
      },
    );
  });

  describe('CORS', () => {
    it('answers an allowed origin with CORS headers, and another origin without', async () => {
      app = await createHttpApp({
        http: buildHttpConfig({ ...loadEnv(), CORS_ORIGINS: [ALLOWED] }),
      });

      const allowed = await request(app.getHttpServer())
        .get('/v1/health')
        .set('Origin', ALLOWED)
        .expect(200);
      expect(allowed.headers['access-control-allow-origin']).toBe(ALLOWED);
      expect(allowed.headers['access-control-expose-headers']).toContain(
        'x-request-id',
      );
      expect(allowed.headers['access-control-expose-headers']).toContain(
        'Retry-After',
      );

      const preflight = await request(app.getHttpServer())
        .options('/v1/health')
        .set('Origin', ALLOWED)
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);
      expect(preflight.headers['access-control-allow-origin']).toBe(ALLOWED);
      expect(preflight.headers['access-control-allow-methods']).toContain(
        'POST',
      );

      const other = await request(app.getHttpServer())
        .get('/v1/health')
        .set('Origin', OTHER)
        .expect(200);
      expect(other.headers['access-control-allow-origin']).toBeUndefined();

      const otherPreflight = await request(app.getHttpServer())
        .options('/v1/health')
        .set('Origin', OTHER)
        .set('Access-Control-Request-Method', 'POST');
      expect(
        otherPreflight.headers['access-control-allow-origin'],
      ).toBeUndefined();
    });

    it('is off when CORS_ORIGINS is empty', async () => {
      app = await createHttpApp({
        http: buildHttpConfig({ ...loadEnv(), CORS_ORIGINS: [] }),
      });
      const res = await request(app.getHttpServer())
        .get('/v1/health')
        .set('Origin', ALLOWED)
        .expect(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('body types', () => {
    beforeEach(async () => {
      app = await createHttpApp({ controllers: [ProbeController] });
    });

    it('refuses a form body with 415 UNSUPPORTED_MEDIA_TYPE: no form parser', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/probe/validate')
        .type('form')
        .send({ name: 'lamb', quantity: '1' })
        .expect(415);
      expect((res.body as ErrorResponseBody).code).toBe(
        'UNSUPPORTED_MEDIA_TYPE',
      );
    });

    it('refuses a text body with 415, and accepts the same data as JSON', async () => {
      await request(app.getHttpServer())
        .post('/v1/probe/validate')
        .set('Content-Type', 'text/plain')
        .send('{"name":"lamb","quantity":1}')
        .expect(415);
      await request(app.getHttpServer())
        .post('/v1/probe/validate')
        .send({ name: 'lamb', quantity: 1 })
        .expect(201);
    });
  });

  describe('bodyless requests', () => {
    beforeEach(async () => {
      app = await createHttpApp({ controllers: [ProbeController] });
      await app.listen(0, '127.0.0.1');
    });

    /** A raw POST, so the test controls every header (supertest adds its own). */
    async function rawPost(
      headers: Record<string, string>,
      body?: string,
    ): Promise<{ status: number; body: string }> {
      const { port } = new URL(await app.getUrl());
      return new Promise((resolve, reject) => {
        const req = httpRequest(
          {
            host: '127.0.0.1',
            port: Number(port),
            method: 'POST',
            path: '/v1/probe/no-body',
            headers,
          },
          (res) => {
            let text = '';
            res.setEncoding('utf8');
            res.on('data', (chunk: string) => (text += chunk));
            res.on('end', () =>
              resolve({ status: res.statusCode ?? 0, body: text }),
            );
          },
        );
        req.on('error', reject);
        req.end(body);
      });
    }

    it('accepts a POST with Content-Length 0 and no Content-Type', async () => {
      const res = await rawPost({ 'Content-Length': '0' });
      expect(res.status).toBe(204);
    });

    it('refuses a POST that has a body but no Content-Type with 415', async () => {
      const res = await rawPost({ 'Content-Length': '2' }, '{}');
      expect(res.status).toBe(415);
      expect((JSON.parse(res.body) as ErrorResponseBody).code).toBe(
        'UNSUPPORTED_MEDIA_TYPE',
      );
    });
  });

  describe('request body limit', () => {
    it('refuses a body over REQUEST_BODY_LIMIT_KB with 413 PAYLOAD_TOO_LARGE', async () => {
      app = await createHttpApp({
        controllers: [ProbeController],
        http: buildHttpConfig({ ...loadEnv(), REQUEST_BODY_LIMIT_KB: 1 }),
      });
      await request(app.getHttpServer())
        .post('/v1/probe/validate')
        .send({ name: 'x'.repeat(500), quantity: 1 })
        .expect(201);
      const res = await request(app.getHttpServer())
        .post('/v1/probe/validate')
        .send({ name: 'x'.repeat(2_000), quantity: 1 })
        .expect(413);
      expect((res.body as ErrorResponseBody).code).toBe('PAYLOAD_TOO_LARGE');
    });
  });
});
