import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ErrorCode } from '@common/errors/error-code.enum';
import { ERROR_STATUSES } from '@common/errors/error-statuses.constants';
import { API_TAGS } from './api-tags.constants';

/**
 * The committed `openapi.json` (kept equal to the code by `pnpm openapi:check`), read as
 * the frontend developers and the client generators read it. Each test lists every
 * operation or field that breaks one rule of `.claude/rules/http.md`, so a failure
 * names what to fix. Which error codes a route really returns is also checked at run
 * time: the e2e suites fail on a code its operation does not document
 * (`test/support/documented-error-codes.ts`).
 */
type Schema = Readonly<{
  $ref?: string;
  allOf?: readonly Schema[];
  type?: string;
  items?: Schema;
  enum?: readonly unknown[];
  description?: string;
  example?: unknown;
  properties?: Readonly<Record<string, Schema>>;
}>;

type Parameter = Readonly<{
  name: string;
  in: string;
  description?: string;
  example?: unknown;
  schema?: Schema;
}>;

type Response = Readonly<{
  description?: string;
  content?: Readonly<Record<string, Readonly<{ schema?: Schema }>>>;
}>;

type Operation = Readonly<{
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: readonly string[];
  security?: readonly Readonly<Record<string, readonly string[]>>[];
  parameters?: readonly Parameter[];
  requestBody?: unknown;
  responses: Readonly<Record<string, Response>>;
}>;

type Document = Readonly<{
  tags?: readonly Readonly<{ name: string; description?: string }>[];
  paths: Readonly<Record<string, Readonly<Record<string, Operation>>>>;
  components: Readonly<{ schemas: Readonly<Record<string, Schema>> }>;
}>;

const DOCUMENT = JSON.parse(
  readFileSync(join(__dirname, '..', '..', '..', 'openapi.json'), 'utf8'),
) as Document;

const METHODS = new Set(['get', 'put', 'post', 'delete', 'patch']);

type Entry = Readonly<{ where: string; path: string; operation: Operation }>;

const OPERATIONS: readonly Entry[] = Object.entries(DOCUMENT.paths).flatMap(
  ([path, item]) =>
    Object.entries(item)
      .filter(([method]) => METHODS.has(method))
      .map(([method, operation]) => ({
        where: `${method.toUpperCase()} ${path}`,
        path,
        operation,
      })),
);

const ERROR_SCHEMA_REF = '#/components/schemas/ErrorResponseDto';
const BEARER = [{ bearer: [] }];

/** `public`, `customer`, `vendor`, `kitchen`, `admin`, or `health` for the probes. */
function audienceOf(path: string): string {
  return path.split('/')[2];
}

const PROTECTED = new Set(['customer', 'vendor', 'kitchen', 'admin']);

/** The codes an error response documents: its description is "Error. code: A, B." */
function codesOf(response: Response): string[] {
  const match = /^Error\. code: ([A-Z_, ]+)\.$/.exec(
    response.description ?? '',
  );
  return match === null ? [] : match[1].split(', ');
}

function documentedCodes(operation: Operation): Set<string> {
  return new Set(
    Object.entries(operation.responses)
      .filter(([status]) => !status.startsWith('2'))
      .flatMap(([, response]) => codesOf(response)),
  );
}

function isErrorResponse(response: Response): boolean {
  return (
    response.content?.['application/json']?.schema?.$ref === ERROR_SCHEMA_REF
  );
}

/** Whether a schema points at another one, whose own fields are checked there. */
function isReference(schema: Schema): boolean {
  return (
    schema.$ref !== undefined ||
    schema.allOf !== undefined ||
    (schema.type === 'array' &&
      schema.items !== undefined &&
      isReference(schema.items))
  );
}

describe('openapi.json', () => {
  it('has operations to check', () => {
    expect(OPERATIONS.length).toBeGreaterThan(70);
  });

  it('gives every operation a summary and a description', () => {
    expect(
      OPERATIONS.filter(
        ({ operation }) =>
          !operation.summary?.trim() || !operation.description?.trim(),
      ).map(({ where }) => where),
    ).toEqual([]);
  });

  it('gives every operation a unique operation id that starts with its audience', () => {
    const ids = OPERATIONS.map(({ operation }) => operation.operationId);
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
    expect(
      OPERATIONS.filter(({ path, operation }) => {
        const id = operation.operationId ?? '';
        return !new RegExp(`^${audienceOf(path)}[A-Z][A-Za-z]+$`).test(id);
      }).map(({ where, operation }) => `${where}: ${operation.operationId}`),
    ).toEqual([]);
  });

  it('puts every operation under exactly one declared tag of its audience', () => {
    const declared: string[] = Object.values(API_TAGS).map((tag) => tag.name);
    expect(DOCUMENT.tags?.map((tag) => tag.name)).toEqual(declared);
    expect(
      OPERATIONS.filter(({ path, operation }) => {
        const tags = operation.tags ?? [];
        return (
          tags.length !== 1 ||
          !declared.includes(tags[0]) ||
          !tags[0].toLowerCase().startsWith(audienceOf(path))
        );
      }).map(({ where, operation }) => `${where}: ${operation.tags?.join()}`),
    ).toEqual([]);
  });

  it('describes one success response per operation, with a schema unless it is 204', () => {
    expect(
      OPERATIONS.filter(({ operation }) => {
        const successes = Object.entries(operation.responses).filter(
          ([status]) => status.startsWith('2'),
        );
        if (successes.length !== 1) {
          return true;
        }
        const [status, response] = successes[0];
        const schema = response.content?.['application/json']?.schema;
        return (
          !response.description?.trim() ||
          (status === '204' ? response.content !== undefined : !schema)
        );
      }).map(({ where }) => where),
    ).toEqual([]);
  });

  it('documents every error response with the shared schema and codes of its status', () => {
    expect(
      OPERATIONS.flatMap(({ where, operation }) =>
        Object.entries(operation.responses)
          .filter(([status]) => !status.startsWith('2'))
          // Readiness answers 503 with its own report: a result, not an error.
          .filter(
            ([status]) =>
              !(where === 'GET /v1/health/ready' && status === '503'),
          )
          .filter(
            ([status, response]) =>
              !isErrorResponse(response) ||
              codesOf(response).length === 0 ||
              codesOf(response).some(
                (code) => ERROR_STATUSES[code as ErrorCode] !== Number(status),
              ),
          )
          .map(([status]) => `${where} ${status}`),
      ),
    ).toEqual([]);
    expect(
      OPERATIONS.filter(
        ({ operation }) =>
          !documentedCodes(operation).has(ErrorCode.INTERNAL_ERROR),
      ).map(({ where }) => where),
    ).toEqual([]);
  });

  it('requires the bearer token on every audience route and marks the others public', () => {
    expect(
      OPERATIONS.filter(({ path, operation }) =>
        PROTECTED.has(audienceOf(path))
          ? JSON.stringify(operation.security) !== JSON.stringify(BEARER)
          : JSON.stringify(operation.security) !== '[]',
      ).map(({ where }) => where),
    ).toEqual([]);
  });

  it('lists the codes every route of an audience can return', () => {
    const required = (path: string): ErrorCode[] => {
      const audience = audienceOf(path);
      if (audience === 'health') {
        return [];
      }
      // Every route reads the database: unreachable, it answers 503.
      const codes = [ErrorCode.RATE_LIMITED, ErrorCode.SERVICE_UNAVAILABLE];
      if (PROTECTED.has(audience)) {
        codes.push(
          ErrorCode.UNAUTHORIZED,
          ErrorCode.ACCESS_TOKEN_EXPIRED,
          ErrorCode.FORBIDDEN,
        );
      }
      if (audience === 'vendor') {
        codes.push(ErrorCode.VENDOR_SUSPENDED);
      }
      return codes;
    };
    expect(
      OPERATIONS.flatMap(({ where, path, operation }) => {
        const documented = documentedCodes(operation);
        return required(path)
          .filter((code) => !documented.has(code))
          .map((code) => `${where}: ${code}`);
      }),
    ).toEqual([]);
  });

  it('lists VALIDATION_FAILED wherever the request has a body, a parameter or a query', () => {
    expect(
      OPERATIONS.filter(
        ({ operation }) =>
          (operation.requestBody !== undefined ||
            (operation.parameters ?? []).length > 0) &&
          !documentedCodes(operation).has(ErrorCode.VALIDATION_FAILED),
      ).map(({ where }) => where),
    ).toEqual([]);
  });

  it('describes every parameter, with an example', () => {
    expect(
      OPERATIONS.flatMap(({ where, operation }) =>
        (operation.parameters ?? [])
          .filter(
            (parameter) =>
              !parameter.description?.trim() ||
              (parameter.example === undefined &&
                parameter.schema?.example === undefined),
          )
          .map((parameter) => `${where} ${parameter.in} ${parameter.name}`),
      ),
    ).toEqual([]);
  });

  it('describes every field of every schema, with an example unless it points at another schema', () => {
    expect(
      Object.entries(DOCUMENT.components.schemas).flatMap(([name, schema]) =>
        Object.entries(schema.properties ?? {})
          .filter(
            ([, property]) =>
              !property.description?.trim() ||
              (property.example === undefined && !isReference(property)),
          )
          .map(([field]) => `${name}.${field}`),
      ),
    ).toEqual([]);
  });
});
