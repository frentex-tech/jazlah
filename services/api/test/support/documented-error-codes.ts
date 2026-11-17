import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';

/**
 * Proves at run time that `openapi.json` lists every error code a route really returns.
 * createHttpApp mounts `recordUndocumentedErrorCodes`: each error answer of a route
 * that `openapi.json` documents is compared with the codes listed under its status, and
 * a code missing there is recorded. `fail-on-undocumented-error-codes.ts` (a setup file
 * of every e2e suite) then fails the suite, naming the route, the status and the code.
 *
 * Answers before routing (unknown paths, the pre-routing limit, a malformed or too large
 * body) have no route and are not checked; nor are the probe routes of the tests, which
 * `openapi.json` does not hold.
 */
type DocumentedResponses = Readonly<
  Record<string, Readonly<{ description?: string }>>
>;

type Document = Readonly<{
  paths: Readonly<
    Record<
      string,
      Readonly<Record<string, Readonly<{ responses: DocumentedResponses }>>>
    >
  >;
}>;

const DOCUMENT = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'openapi.json'), 'utf8'),
) as Document;

const undocumented: string[] = [];

/** What the suite found so far: `POST /v1/... 409 SOME_CODE`, each once. */
export function undocumentedErrorCodes(): readonly string[] {
  return [...new Set(undocumented)];
}

function codeOf(body: unknown): string | null {
  if (typeof body === 'object' && body !== null && 'code' in body) {
    const { code } = body;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

function check(req: Request, status: number, code: string): void {
  // Express types `req.route` as any: read it as unknown and narrow.
  const matched: unknown = (req as { route?: unknown }).route;
  const route: unknown =
    typeof matched === 'object' && matched !== null && 'path' in matched
      ? matched.path
      : undefined;
  if (typeof route !== 'string') {
    return;
  }
  const path = route.replace(/:(\w+)/g, '{$1}');
  const method = req.method.toLowerCase();
  const operation = DOCUMENT.paths[path]?.[method];
  if (operation === undefined) {
    return;
  }
  const description = operation.responses[String(status)]?.description ?? '';
  const listed = /^Error\. code: ([A-Z_, ]+)\.$/.exec(description);
  if (listed === null || !listed[1].split(', ').includes(code)) {
    undocumented.push(`${req.method} ${path} ${status} ${code}`);
  }
}

export function recordUndocumentedErrorCodes(
  app: NestExpressApplication,
): void {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const json = res.json.bind(res);
    res.json = (body: unknown) => {
      const code = codeOf(body);
      if (res.statusCode >= 400 && code !== null) {
        check(req, res.statusCode, code);
      }
      return json(body);
    };
    next();
  });
}
