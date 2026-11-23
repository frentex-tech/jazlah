// `pnpm docs:check`: the frontend integration guides (docs/frontend/ at the repository
// root) name only what the API really has.
// - Every endpoint path they mention (`/v1/...`, with `{param}` placeholders as in
//   openapi.json, optionally after its method) must be an operation of openapi.json. A
//   path written as a prefix (`/v1/vendor/...`, `/v1/<audience>/...`) must begin one.
// - Every UPPER_SNAKE_CASE word in backticks must be an error code of the document, or a
//   value its descriptions name (a `details.reason`, for example), or one of the
//   environment variables listed below.
// Exit code 1 lists each mismatch with its file and line.
//
// Run in CI after `pnpm openapi:check`, so openapi.json is the code's own document.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPOSITORY = join(API_ROOT, '..', '..');
const DOCS = join(REPOSITORY, 'docs', 'frontend');

const document = JSON.parse(
  readFileSync(join(API_ROOT, 'openapi.json'), 'utf8'),
);
const METHODS = ['get', 'put', 'post', 'delete', 'patch'];
const operations = new Map(
  Object.entries(document.paths).map(([path, item]) => [
    path,
    new Set(METHODS.filter((method) => item[method] !== undefined)),
  ]),
);
const errorCodes = new Set(document.components.schemas.ErrorCode.enum);
const documentText = JSON.stringify(document);

// Environment variables the guides name: not in openapi.json, checked against
// .env.example instead.
const environment = readFileSync(join(API_ROOT, '.env.example'), 'utf8');

function isKnownWord(word) {
  return (
    errorCodes.has(word) ||
    new RegExp(`\\b${word}\\b`).test(documentText) ||
    new RegExp(`^#?\\s*${word}=`, 'm').test(environment)
  );
}

// `GET /v1/customer/addresses/{id}`, or a bare `/v1/...` path. A path ends at the first
// character a path never holds (space, backtick, bracket, quote, `?`, `#`, `,`, `)`).
const ENDPOINT =
  /(?:\b(GET|POST|PUT|PATCH|DELETE)\s+)?(\/v1\/[A-Za-z0-9_\-/{}.]*[A-Za-z0-9_\-}])/g;
// An UPPER_SNAKE_CASE word with at least one underscore, in backticks.
const WORD = /`([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)`/g;

function markdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return markdownFiles(path);
    }
    return entry.name.endsWith('.md') ? [path] : [];
  });
}

const problems = [];
let endpointCount = 0;
const files = markdownFiles(DOCS);
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    const where = `${relative(REPOSITORY, file).replaceAll('\\', '/')}:${index + 1}`;
    for (const match of line.matchAll(ENDPOINT)) {
      const [whole, method, rawPath] = match;
      endpointCount += 1;
      const path = rawPath.replace(/\/$/, '');
      const after = line.slice(match.index + whole.length);
      if (/^\/(\.\.\.|<)/.test(after)) {
        if (![...operations.keys()].some((known) => known.startsWith(`${path}/`))) {
          problems.push(`${where}: no path of openapi.json starts with ${path}/`);
        }
        continue;
      }
      const methods = operations.get(path);
      if (methods === undefined) {
        problems.push(`${where}: ${path} is not a path of openapi.json`);
      } else if (method !== undefined && !methods.has(method.toLowerCase())) {
        problems.push(
          `${where}: ${method} ${path} is not an operation of openapi.json`,
        );
      }
    }
    for (const [, word] of line.matchAll(WORD)) {
      if (!isKnownWord(word)) {
        problems.push(
          `${where}: ${word} is not an error code, nor a value openapi.json names, nor a variable of .env.example`,
        );
      }
    }
  });
}

if (files.length === 0) {
  problems.push(`no Markdown file found in ${DOCS}`);
}
if (problems.length > 0) {
  process.stderr.write(
    `The frontend guides name what openapi.json does not have:\n${problems
      .map((problem) => `  ${problem}`)
      .join('\n')}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `docs/frontend: ${files.length} files, ${endpointCount} endpoint mentions, all in openapi.json.\n`,
  );
}
