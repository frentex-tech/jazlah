import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { buildHttpConfig } from '@config/build-http-config';
import { loadEnv } from '@config/load-env';
import { createHttpApp } from './support/create-http-app';
import type { OpenApiDocument } from './support/open-api-document.type';

const ERROR_SCHEMA = {
  'application/json': {
    schema: { $ref: '#/components/schemas/ErrorResponseDto' },
  },
};

describe('API documentation (e2e)', () => {
  let app: NestExpressApplication;

  afterEach(async () => {
    await app.close();
  });

  describe('in test', () => {
    let document: OpenApiDocument;

    beforeEach(async () => {
      app = await createHttpApp();
      const res = await request(app.getHttpServer())
        .get('/docs-json')
        .expect(200)
        .expect('Content-Type', /application\/json/);
      document = res.body as OpenApiDocument;
    });

    it('serves the Swagger page at /docs', async () => {
      const res = await request(app.getHttpServer())
        .get('/docs')
        .expect(200)
        .expect('Content-Type', /text\/html/);
      expect(res.text).toContain('<title>JAZLA API documentation</title>');
    });

    it('states the title, the version, the /v1 prefix and the bearer scheme', () => {
      expect(document.info).toMatchObject({
        title: 'JAZLA API',
        version: '1.0.0',
      });
      expect(document.info.description).toContain('/v1');
      const paths = Object.keys(document.paths);
      expect(paths.length).toBeGreaterThan(0);
      expect(paths.filter((path) => !path.startsWith('/v1/'))).toEqual([]);
      expect(document.components.securitySchemes).toMatchObject({
        bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      });
    });

    it('documents the health endpoints with their bodies and the shared error schema', () => {
      const liveness = document.paths['/v1/health'].get.responses;
      expect(liveness['200']).toMatchObject({
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LivenessResponseDto' },
          },
        },
      });
      expect(liveness['500']).toMatchObject({ content: ERROR_SCHEMA });

      const readiness = document.paths['/v1/health/ready'].get.responses;
      const readinessBody = {
        'application/json': {
          schema: { $ref: '#/components/schemas/ReadinessResponseDto' },
        },
      };
      expect(readiness['200']).toMatchObject({ content: readinessBody });
      expect(readiness['503']).toMatchObject({ content: readinessBody });
      expect(readiness['500']).toMatchObject({ content: ERROR_SCHEMA });

      const schemas = document.components.schemas;
      expect(Object.keys(schemas).sort()).toEqual([
        'ErrorCode',
        'ErrorResponseDto',
        'FieldErrorDto',
        'LivenessResponseDto',
        'ReadinessChecksDto',
        'ReadinessResponseDto',
      ]);
      expect(schemas.ErrorResponseDto).toMatchObject({
        required: ['code', 'message', 'requestId'],
      });
      expect(schemas.ReadinessResponseDto).toMatchObject({
        properties: {
          status: { enum: ['ok', 'unavailable'] },
          checks: { $ref: '#/components/schemas/ReadinessChecksDto' },
        },
      });
    });

    it('serves the same document as the committed openapi.json', () => {
      const committed = JSON.parse(
        readFileSync(join(__dirname, '..', 'openapi.json'), 'utf8'),
      ) as unknown;
      expect(document).toEqual(committed);
    });
  });

  describe('in production', () => {
    it('is not served when API_DOCS_ENABLED is not set', async () => {
      app = await createHttpApp({
        http: buildHttpConfig({
          ...loadEnv(),
          NODE_ENV: 'production',
          API_DOCS_ENABLED: undefined,
        }),
      });
      await request(app.getHttpServer()).get('/docs-json').expect(404);
      await request(app.getHttpServer()).get('/docs').expect(404);
      // The API itself is unaffected.
      await request(app.getHttpServer()).get('/v1/health').expect(200);
    });

    it('is served when API_DOCS_ENABLED=true', async () => {
      app = await createHttpApp({
        http: buildHttpConfig({
          ...loadEnv(),
          NODE_ENV: 'production',
          API_DOCS_ENABLED: true,
        }),
      });
      await request(app.getHttpServer()).get('/docs-json').expect(200);
    });
  });
});
