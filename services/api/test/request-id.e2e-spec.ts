import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { ErrorResponseBody } from '@common/filters/error-response-body.interface';
import { createProbeApp } from './support/create-probe-app';

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('Request id (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createProbeApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('a supplied id comes back in the header and in the error body', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/probe/conflict')
      .set('x-request-id', 'client-abc-123')
      .expect(409);
    expect(res.headers['x-request-id']).toBe('client-abc-123');
    expect((res.body as ErrorResponseBody).requestId).toBe('client-abc-123');
  });

  it('a successful response carries the id too', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/health')
      .set('x-request-id', 'client-abc-124')
      .expect(200);
    expect(res.headers['x-request-id']).toBe('client-abc-124');
  });

  it('a request without an id gets a generated one', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/health')
      .expect(200);
    expect(res.headers['x-request-id']).toMatch(UUID);
  });

  it.each([
    ['oversized', 'a'.repeat(129)],
    ['unsafe', 'abc def<script>'],
  ])('an %s id is replaced by a generated one', async (_label, id) => {
    const res = await request(app.getHttpServer())
      .get('/v1/probe/conflict')
      .set('x-request-id', id)
      .expect(409);
    const header = res.headers['x-request-id'];
    expect(header).toMatch(UUID);
    expect((res.body as ErrorResponseBody).requestId).toBe(header);
  });
});
