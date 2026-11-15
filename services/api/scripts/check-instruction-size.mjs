#!/usr/bin/env node
/**
 * Measures the instruction files Claude Code loads into every session started in
 * services/api, and fails when together they pass the limit.
 *
 *   node scripts/check-instruction-size.mjs     (pnpm instructions:check)
 *
 * Always loaded, as Claude Code resolves them:
 *   - every CLAUDE.md from services/api up to the repository root;
 *   - each file a loaded file imports with an `@path` line (recursively);
 *   - each `.claude/rules/*.md` without `paths:` in its front matter (a rule with
 *     `paths:` loads only when a matching file is opened, so it does not count).
 *
 * Size is counted in characters (Unicode code points), not bytes. Every file is listed
 * with its size, largest first, so a failure says where to cut. The root CLAUDE.md is
 * outside services/api but counts: it is loaded too.
 *
 * Run by the pre-commit hook when a staged file is one of these (or a rule file), and
 * by CI. No dependencies; the working directory does not matter.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The most characters the always-loaded instructions may hold together. */
const LIMIT = 50_000;

const API_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RULES_FOLDER = join(API_ROOT, '.claude', 'rules');

/** The CLAUDE.md files from services/api up to the repository root (the folder holding .git). */
function findClaudeFiles() {
  const found = [];
  let folder = API_ROOT;
  for (;;) {
    const file = join(folder, 'CLAUDE.md');
    if (existsSync(file)) found.push(file);
    if (existsSync(join(folder, '.git'))) return found;
    const parent = dirname(folder);
    if (parent === folder) return found;
    folder = parent;
  }
}

/** Files imported with a line starting `@` (Claude Code's import syntax), relative to the importer. */
function findImports(file) {
  const imports = [];
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^@(\S+)\s*$/.exec(line.trim());
    if (match) imports.push(resolve(dirname(file), match[1]));
  }
  return imports;
}

/** True when a rule file's front matter limits it to `paths:`. */
function isPathScoped(file) {
  const text = readFileSync(file, 'utf8');
  const frontMatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  return frontMatter !== null && /^paths:/m.test(frontMatter[1]);
}

function collectLoadedFiles() {
  const loaded = new Set();
  const pending = [...findClaudeFiles()];
  if (existsSync(RULES_FOLDER)) {
    for (const name of readdirSync(RULES_FOLDER).sort()) {
      const file = join(RULES_FOLDER, name);
      if (name.endsWith('.md') && !isPathScoped(file)) pending.push(file);
    }
  }
  while (pending.length > 0) {
    const file = pending.shift();
    if (loaded.has(file) || !existsSync(file)) continue;
    loaded.add(file);
    pending.push(...findImports(file));
  }
  return [...loaded];
}

const sizes = collectLoadedFiles()
  .map((file) => ({
    name: relative(API_ROOT, file).replace(/\\/g, '/'),
    size: [...readFileSync(file, 'utf8')].length,
  }))
  .sort((a, b) => b.size - a.size);
const total = sizes.reduce((sum, { size }) => sum + size, 0);
const width = String(total).length;

for (const { name, size } of sizes) {
  console.log(`${String(size).padStart(width)}  ${name}`);
}
console.log(`${String(total).padStart(width)}  total (limit ${LIMIT})`);

if (total > LIMIT) {
  console.error(
    `Always-loaded instructions are ${total - LIMIT} characters over the limit of ${LIMIT}. ` +
      'Move detail to doc comments in the code or to a file loaded on demand, and remove repetition; drop no rule.',
  );
  process.exit(1);
}
console.log('Always-loaded instructions are within the limit.');
