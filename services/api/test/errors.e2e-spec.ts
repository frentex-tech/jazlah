import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ERROR_MESSAGES } from '@common/errors/error-messages.constants';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { createProbeApp } from './support/create-probe-app';

describe('Error responses (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createProbeApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('an unknown route returns 404 NOT_FOUND in the standard shape', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/does-not-exist')
      .expect(404);
    const body = res.body as ErrorResponseBody;
    expect(Object.keys(body).sort()).toEqual(['code', 'message', 'requestId']);
    expect(body.code).toBe('NOT_FOUND');
    expect(body.message).toBe(ERROR_MESSAGES.NOT_FOUND.ar);
    expect(body.requestId).toBe(res.headers['x-request-id']);
  });

  it('an invalid body returns 400 VALIDATION_FAILED with each field', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/probe/validate')
      .send({ name: '', quantity: 'many' })
      .expect(400);
    const body = res.body as ErrorResponseBody;
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.details).toEqual([
      { field: 'name', constraints: ['isNotEmpty'] },
      { field: 'quantity', constraints: ['min', 'isInt'] },
    ]);
  });

  it('an unknown extra field is rejected', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/probe/validate')
      .send({ name: 'a', quantity: 1, isAdmin: true })
      .expect(400);
    const body = res.body as ErrorResponseBody;
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.details).toEqual([
      { field: 'isAdmin', constraints: ['whitelistValidation'] },
    ]);
  });

  it('a 405 returns METHOD_NOT_ALLOWED', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/probe/method-not-allowed')
      .expect(405);
    const body = res.body as ErrorResponseBody;
    expect(body.code).toBe('METHOD_NOT_ALLOWED');
    expect(body.message).toBe(ERROR_MESSAGES.METHOD_NOT_ALLOWED.ar);
  });

  it('a 400 that is not a validation failure returns BAD_REQUEST', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/probe/bad-request')
      .expect(400);
    const body = res.body as ErrorResponseBody;
    expect(body.code).toBe('BAD_REQUEST');
    expect(body).not.toHaveProperty('details');
    expect(res.text).not.toContain('not a validation failure');
  });

  it('malformed JSON returns 400 BAD_REQUEST, not VALIDATION_FAILED', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/probe/validate')
      .set('Content-Type', 'application/json')
      .send('{"name": ')
      .expect(400);
    expect((res.body as ErrorResponseBody).code).toBe('BAD_REQUEST');
  });

  it('an oversized body returns 413 PAYLOAD_TOO_LARGE', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/probe/validate')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ name: 'x'.repeat(200_000), quantity: 1 }))
      .expect(413);
    expect((res.body as ErrorResponseBody).code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('a valid body passes validation', async () => {
    await request(app.getHttpServer())
      .post('/v1/probe/validate')
      .send({ name: 'a', quantity: 2 })
      .expect(201)
      .expect({ name: 'a', quantity: 2 });
  });

  it('a plain Error returns 500 INTERNAL_ERROR without its message', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/probe/plain-error')
      .expect(500);
    const body = res.body as ErrorResponseBody;
    expect(body.code).toBe('INTERNAL_ERROR');
    expect(Object.keys(body).sort()).toEqual(['code', 'message', 'requestId']);
    expect(res.text).not.toContain('internal detail');
    expect(res.text).not.toContain('10.0.0.5');
    expect(res.text).not.toContain('Error');
  });

  it('an AppError with CONFLICT returns 409 with its details', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/probe/conflict')
      .expect(409);
    const body = res.body as ErrorResponseBody;
    expect(body.code).toBe('CONFLICT');
    expect(body.details).toEqual({ reason: 'ALREADY_EXISTS' });
  });

  it('the message is Arabic by default', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/probe/conflict')
      .expect(409);
    expect((res.body as ErrorResponseBody).message).toBe(
      ERROR_MESSAGES.CONFLICT.ar,
    );
  });

  it('the message is English with Accept-Language: en', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/probe/conflict')
      .set('Accept-Language', 'en')
      .expect(409);
    expect((res.body as ErrorResponseBody).message).toBe(
      ERROR_MESSAGES.CONFLICT.en,
    );
  });
});
