// Proves the lint rules in eslint.config.mjs: lints every fixture in lint-fixtures/src
// with the real config and checks it against the expectation written on its first line:
//
//   // lint-rule: <ids> violates   -> reports at least one problem, all of them the rule's
//   // lint-rule: <ids> conforms   -> reports nothing
//   // lint-rule: support          -> reports nothing (a file other fixtures import)
//
// Every rule below must have at least one violating and one conforming fixture.
// Exits with code 1, naming each failing fixture, if any expectation fails.
import { ESLint } from 'eslint';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const FIXTURES = join(ROOT, 'lint-fixtures', 'src');

/**
 * Each rule: what it says, the ESLint rule (or rules) that enforce it, and the tag its
 * messages start with.
 */
const COMMENTS = '@eslint-community/eslint-comments';
const RULES = {
  R0: { title: 'every import fits a folder rule, and every file under src/ belongs to an element', eslintRule: ['boundaries/dependencies', 'no-restricted-syntax'], tag: '[R0]' },
  R1: { title: 'common imports only from config and common', eslintRule: 'boundaries/dependencies', tag: '[R1]' },
  R2: { title: 'config imports only from config and common', eslintRule: 'boundaries/dependencies', tag: '[R2]' },
  R3: { title: 'infra imports only from config, common and infra', eslintRule: 'boundaries/dependencies', tag: '[R3]' },
  R4: { title: 'an integration imports only config, common, infra and itself', eslintRule: 'boundaries/dependencies', tag: '[R4]' },
  R5: { title: 'a module imports only config, common, infra, integrations and modules', eslintRule: 'boundaries/dependencies', tag: '[R5]' },
  R6: { title: 'an integration is imported from outside only through its index.ts', eslintRule: 'boundaries/dependencies', tag: '[R6]' },
  R7: { title: 'a module is imported from outside only through its index.ts', eslintRule: 'boundaries/dependencies', tag: '[R7]' },
  R8: { title: 'domain/ imports only its own domain/ and the plain parts of common, which import no package', eslintRule: 'boundaries/dependencies', tag: '[R8]' },
  'R9-any': { title: 'no explicit any', eslintRule: '@typescript-eslint/no-explicit-any' },
  'R9-unsafe-assignment': { title: 'no assignment of an any value', eslintRule: '@typescript-eslint/no-unsafe-assignment' },
  'R9-unsafe-member-access': { title: 'no member access on an any value', eslintRule: '@typescript-eslint/no-unsafe-member-access' },
  'R9-unsafe-call': { title: 'no call of an any value', eslintRule: '@typescript-eslint/no-unsafe-call' },
  'R9-unsafe-return': { title: 'no return of an any value', eslintRule: '@typescript-eslint/no-unsafe-return' },
  'R9-unsafe-argument': { title: 'no any passed as an argument', eslintRule: '@typescript-eslint/no-unsafe-argument' },
  'R10-ts-ignore': { title: '@ts-ignore is banned', eslintRule: '@typescript-eslint/ban-ts-comment' },
  'R10-ts-nocheck': { title: '@ts-nocheck is banned', eslintRule: '@typescript-eslint/ban-ts-comment' },
  'R10-ts-expect-error': { title: '@ts-expect-error needs a description', eslintRule: '@typescript-eslint/ban-ts-comment' },
  R11: { title: 'only src/config/load-env.ts reads process.env, however it is reached', eslintRule: ['no-restricted-properties', 'no-restricted-imports', 'no-restricted-syntax'], tag: '[R11]' },
  R12: { title: 'a disable comment covers one line, names its rules, says why, and never names a protected rule', eslintRule: [`${COMMENTS}/require-description`, `${COMMENTS}/no-unlimited-disable`, `${COMMENTS}/no-use`, `${COMMENTS}/no-restricted-disable`] },
  'R13-floating-promise': { title: 'no floating promises', eslintRule: '@typescript-eslint/no-floating-promises' },
  'R13-console': { title: 'no console in src/', eslintRule: 'no-console' },
  R14: { title: 'only repositories and CRUD root services import the Prisma client; no module imports PrismaService', eslintRule: 'boundaries/dependencies', tag: '[R14]' },
  R15: { title: 'queues are registered only through QueueRegistrationModule (the name registerQueue appears nowhere else)', eslintRule: 'no-restricted-syntax', tag: '[R15]' },
  R16: { title: 'only src/infra/event-bus imports @nestjs/event-emitter', eslintRule: 'boundaries/dependencies', tag: '[R16]' },
  R17: { title: 'WorkerHost, QueueEvents and FlowProducer are used only inside src/infra/queue', eslintRule: 'no-restricted-syntax', tag: '[R17]' },
  R18: { title: 'a job processor does not override process', eslintRule: 'no-restricted-syntax', tag: '[R18]' },
  R19: { title: '@Throttle and @SkipThrottle are used only inside src/infra/rate-limit', eslintRule: ['no-restricted-imports', 'no-restricted-syntax'], tag: '[R19]' },
  R20: { title: 'no Prisma *OrThrow method in a module', eslintRule: 'no-restricted-syntax', tag: '[R20]' },
  R21: { title: 'no type assertion from any or unknown to a concrete type', eslintRule: 'jazla/no-assertion-from-unknown', tag: '[R21]' },
  R22: { title: "an integration's testing.ts is imported only by tests (*.spec.ts, test/)", eslintRule: 'boundaries/dependencies', tag: '[R22]' },
};

function listFixtures(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listFixtures(path);
    return entry.name.endsWith('.ts') ? [path] : [];
  });
}

function readExpectation(path) {
  const firstLine = readFileSync(path, 'utf8').split(/\r?\n/, 1)[0];
  const match = /^\/\/ lint-rule: (.+?) (violates|conforms)$/.exec(firstLine);
  if (match) return { ids: match[1].split(' '), kind: match[2] };
  if (firstLine === '// lint-rule: support') return { ids: [], kind: 'support' };
  return null;
}

const eslint = new ESLint({ cwd: ROOT });
const results = await eslint.lintFiles([FIXTURES.replaceAll('\\', '/') + '/**/*.ts']);
const byPath = new Map(results.map((r) => [r.filePath, r]));

const failures = [];
const coverage = Object.fromEntries(
  Object.keys(RULES).map((id) => [id, { violates: [], conforms: [] }]),
);

for (const path of listFixtures(FIXTURES)) {
  const name = relative(ROOT, path).replaceAll('\\', '/');
  const expectation = readExpectation(path);
  const result = byPath.get(path);
  if (!expectation) {
    failures.push(`${name}: first line must be "// lint-rule: <ids> violates|conforms" or "// lint-rule: support"`);
    continue;
  }
  if (!result) {
    failures.push(`${name}: was not linted (is it ignored by the ESLint config?)`);
    continue;
  }
  const unknown = expectation.ids.filter((id) => !RULES[id]);
  if (unknown.length > 0) {
    failures.push(`${name}: unknown rule id ${unknown.join(', ')}`);
    continue;
  }
  const messages = result.messages.map((m) => `${m.ruleId ?? 'fatal'}: ${m.message}`);

  if (expectation.kind === 'violates') {
    if (expectation.ids.length !== 1) {
      failures.push(`${name}: a violating fixture names exactly one rule`);
      continue;
    }
    const id = expectation.ids[0];
    const rule = RULES[id];
    const eslintRules = [rule.eslintRule].flat();
    const wrong = result.messages.filter(
      (m) => !eslintRules.includes(m.ruleId) || (rule.tag && !m.message.includes(rule.tag)),
    );
    if (result.messages.length === 0) {
      failures.push(`${name}: expected ${id} (${eslintRules.join(', ')}) to report, but nothing was reported`);
    } else if (wrong.length > 0) {
      failures.push(`${name}: expected only ${id} (${eslintRules.join(', ')}), got:\n      ${messages.join('\n      ')}`);
    } else {
      coverage[id].violates.push(name);
    }
  } else if (result.messages.length > 0) {
    failures.push(`${name}: expected no problems (${expectation.kind}), got:\n      ${messages.join('\n      ')}`);
  } else {
    for (const id of expectation.ids) coverage[id].conforms.push(name);
  }
}

for (const [id, { violates, conforms }] of Object.entries(coverage)) {
  if (violates.length === 0) failures.push(`${id}: no violating fixture`);
  if (conforms.length === 0) failures.push(`${id}: no conforming fixture`);
}

console.log('Lint rules and their fixtures (lint-fixtures/src):\n');
for (const [id, rule] of Object.entries(RULES)) {
  const { violates, conforms } = coverage[id];
  console.log(`${id.padEnd(24)} ${rule.title}  [${[rule.eslintRule].flat().join(', ')}]`);
  for (const f of violates) console.log(`    violates  ${f}`);
  for (const f of conforms) console.log(`    conforms  ${f}`);
}

if (failures.length > 0) {
  console.error(`\nlint:rules FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\nlint:rules passed: ${Object.keys(RULES).length} rules, ${listFixtures(FIXTURES).length} fixtures.`);
