import { createServer, type Server } from 'node:http';
import { test as base, expect, type BrowserContext } from '@playwright/test';
import type { components, paths } from '../src/api/schema';

// A stub of the API for the real (non-mock) build: the dashboard server calls it as API_URL. Every reply is typed by
// the operation and status in the generated schema.d.ts (openapi.json), so a body the contract does not allow fails the
// typecheck. Each test sets the replies it needs; an unset route answers 404 NOT_FOUND and is listed in `unhandled`.

export const STUB_PORT = Number(process.env.STUB_PORT ?? 3999);
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
type Op<P extends keyof paths, M extends Method> = paths[P][M];
type MethodOf<P extends keyof paths> = { [M in Method]: Op<P, M> extends { responses: unknown } ? M : never }[Method];
type Responses<O> = O extends { responses: infer R } ? R : never;
type StatusOf<P extends keyof paths, M extends Method> = keyof Responses<Op<P, M>> & number;
type Json<R> = R extends { content: { 'application/json': infer B } } ? B : null;
export type BodyOf<P extends keyof paths, M extends Method, S> = Json<Responses<Op<P, M>>[S & keyof Responses<Op<P, M>>]>;
/** The request body the operation takes (what the dashboard sent; the stub trusts the dashboard's own typing). */
type RequestOf<P extends keyof paths, M extends Method> = Op<P, M> extends { requestBody?: { content: { 'application/json': infer B } } } ? B : null;

export type Call<B = unknown> = { method: string; path: string; query: URLSearchParams; body: B; auth: string | null };
type Route = { method: string; re: RegExp; status: number; reply: (call: Call) => unknown };

/** An ErrorResponseDto. */
export const error = (code: components['schemas']['ErrorCode'], details?: components['schemas']['ErrorResponseDto']['details']): components['schemas']['ErrorResponseDto'] => ({
  code,
  message: code,
  requestId: 'stub-request',
  ...(details && { details }),
});
/** What every Sprint 3 route answers until its task lands (orders.md). */
export const notImplemented = (task: string) => error('NOT_IMPLEMENTED', { task });

export class Stub {
  private routes: Route[] = [];
  calls: Call[] = [];
  unhandled: string[] = [];

  /** Replies to `method path` (path as in openapi.json, `{id}` matching one segment); the latest one set wins. */
  on<P extends keyof paths, M extends MethodOf<P>, S extends StatusOf<P, M>>(method: M, path: P, status: S, reply: BodyOf<P, M, S> | ((call: Call<RequestOf<P, M>>) => BodyOf<P, M, S>)) {
    const re = new RegExp(`^${String(path).replace(/\{[^}]+\}/g, '[^/]+')}$`);
    this.routes.unshift({ method: method.toUpperCase(), re, status, reply: typeof reply === 'function' ? (reply as (c: Call) => unknown) : () => reply });
    return this;
  }

  /** The calls made to `method path` (an exact path), oldest first. */
  callsTo(method: Method, path: string) {
    return this.calls.filter((c) => c.method === method.toUpperCase() && c.path === path);
  }

  reset() {
    this.routes = [];
    this.calls = [];
    this.unhandled = [];
  }

  listen(port: number) {
    const server: Server = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        const url = new URL(req.url ?? '/', 'http://stub');
        const raw = Buffer.concat(chunks).toString();
        const call: Call = { method: req.method ?? 'GET', path: url.pathname, query: url.searchParams, body: raw ? JSON.parse(raw) : null, auth: req.headers.authorization ?? null };
        this.calls.push(call);
        const route = this.routes.find((r) => r.method === call.method && r.re.test(call.path));
        if (!route) this.unhandled.push(`${call.method} ${call.path}`);
        const status = route?.status ?? 404;
        const body = route ? route.reply(call) : error('NOT_FOUND');
        res.writeHead(status, { 'Content-Type': 'application/json' }).end(body === null ? undefined : JSON.stringify(body));
      });
    });
    return new Promise<Server>((resolve) => server.listen(port, () => resolve(server)));
  }
}

export const TOKEN = { admin: 'stub-at-admin', vendor: 'stub-at-vendor' } as const;

/** A staff session as the dashboard's sign-in leaves it (cookies only); the stub sees `Bearer stub-at-<panel>`. */
export async function signInAs(context: BrowserContext, panels: ('admin' | 'vendor')[]) {
  const base = { url: `http://localhost:${process.env.PORT ?? 3003}`, httpOnly: true };
  await context.addCookies([
    { ...base, name: 'jz_panels', value: panels.join(',') },
    ...panels.flatMap((p) => [
      { ...base, name: `jz_rt_${p}`, value: `stub-rt-${p}` },
      { ...base, name: `jz_at_${p}`, value: TOKEN[p] },
      { ...base, name: `jz_ph_${p}`, value: '+966 5•• ••• 004' },
    ]),
  ]);
}

/** `api`: the stub, emptied before each test. One server per worker on STUB_PORT (workers: 1). */
export const test = base.extend<{ api: Stub }, { stub: Stub }>({
  stub: [
    async ({}, use) => {
      const stub = new Stub();
      const server = await stub.listen(STUB_PORT);
      await use(stub);
      await new Promise((r) => server.close(r));
    },
    { scope: 'worker' },
  ],
  api: [
    async ({ stub, page }, use) => {
      stub.reset();
      await use(stub);
      // Leave the page and let the server's last calls land, so they are checked here and never reach the next test.
      await page.goto('about:blank');
      for (let n = -1; n !== stub.calls.length; ) {
        n = stub.calls.length;
        await new Promise((r) => setTimeout(r, 300));
      }
      // Every API call a screen makes must be one the test answered: an unexpected route is a contract drift.
      expect(stub.unhandled, 'API calls no reply was set for').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect } from '@playwright/test';
