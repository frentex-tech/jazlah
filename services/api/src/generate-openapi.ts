import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { NestFactory } from '@nestjs/core';
import { buildOpenApiDocument } from '@infra/api-docs/build-openapi-document';
import { GLOBAL_PREFIX } from '@infra/http/http.constants';
import { AppModule } from './app.module';

/**
 * `pnpm openapi:generate` (write) and `pnpm openapi:check` (check): the OpenAPI
 * document of the application, in `openapi.json` at the project root.
 *
 * The application is created in preview mode: Nest builds the module graph and reads
 * the route metadata without instantiating any provider, so nothing connects to the
 * database or Redis, no configuration is read and no server starts.
 *
 * `check` exits with code 1 when `openapi.json` differs from the code.
 */
const OUTPUT = join(__dirname, '..', 'openapi.json');

async function main(mode: string | undefined): Promise<number> {
  if (mode !== 'write' && mode !== 'check') {
    process.stderr.write('usage: generate-openapi.ts write|check\n');
    return 1;
  }
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: false,
    abortOnError: false,
  });
  app.setGlobalPrefix(GLOBAL_PREFIX);
  const text = `${JSON.stringify(buildOpenApiDocument(app), null, 2)}\n`;
  await app.close();

  if (mode === 'write') {
    writeFileSync(OUTPUT, text);
    process.stdout.write(`Wrote ${OUTPUT}\n`);
    return 0;
  }
  if (!isSameDocument(OUTPUT, text)) {
    process.stderr.write(
      'openapi.json is out of date with the code. Run `pnpm openapi:generate` and include the file in your change.\n',
    );
    return 1;
  }
  process.stdout.write('openapi.json is up to date.\n');
  return 0;
}

/**
 * Whether the file holds the same document as `text`, compared as parsed JSON, so line
 * endings or whitespace alone (a Windows checkout) never make it "out of date". A
 * missing or unreadable file is not the same.
 */
function isSameDocument(path: string, text: string): boolean {
  try {
    return isDeepStrictEqual(
      JSON.parse(readFileSync(path, 'utf8')),
      JSON.parse(text),
    );
  } catch {
    return false;
  }
}

main(process.argv[2]).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
    );
    process.exitCode = 1;
  },
);
