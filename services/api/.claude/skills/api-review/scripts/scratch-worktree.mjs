#!/usr/bin/env node
/**
 * A throwaway copy of the code under review, so the reviewer can run and break things
 * without touching the working tree.
 *
 *   node scratch-worktree.mjs create [ref]    default ref: HEAD. Prints the folder.
 *   node scratch-worktree.mjs remove <folder> removes one made by `create`
 *   node scratch-worktree.mjs list            scratch copies still present
 *
 * What it is for:
 *   - reading and running a target that is not the branch checked out;
 *   - checking that a test fails without its rule: remove the rule IN THE SCRATCH COPY,
 *     run that one spec there, see it fail. The real files are never edited.
 *
 * How: `git worktree add --detach` in the system temp folder (a second checkout of the
 * same repository at that commit; no branch is created or moved), then, inside its
 * services/api:
 *   - `node_modules` is a link to the real one (a junction on Windows), so nothing is
 *     installed and nothing is copied;
 *   - the generated Prisma client is copied, because it is not committed.
 * There is no `.env` in the copy: unit tests need none. Run e2e tests and `pnpm infra:*`
 * in the real checkout only.
 *
 * `remove` deletes the link first, without following it, then the worktree, and checks
 * the real node_modules is still there. It refuses a folder it did not make.
 *
 * No dependencies; the working directory does not matter.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, rmdirSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** services/api: this file is at .claude/skills/api-review/scripts/ inside it. */
const API_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
/** Every scratch copy lives here, so `remove` can tell its own folders from others. */
const SCRATCH_HOME = join(tmpdir(), 'jazla-api-review');
/** Not committed, and needed to compile: copied into the scratch copy. */
const GENERATED_CLIENT = join('src', 'infra', 'database', 'generated');

function git(args, cwd = API_ROOT) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const REPO_ROOT = resolve(git(['rev-parse', '--show-toplevel']));
const API_PREFIX = relative(REPO_ROOT, API_ROOT);

function create(ref) {
  let commit;
  try {
    commit = git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);
  } catch {
    fail(`"${ref}" is not a commit.`);
  }
  mkdirSync(SCRATCH_HOME, { recursive: true });
  const folder = join(SCRATCH_HOME, `${commit.slice(0, 10)}-${Date.now().toString(36)}`);
  git(['worktree', 'add', '--detach', '--quiet', folder, commit]);

  const api = join(folder, API_PREFIX);
  const realModules = join(API_ROOT, 'node_modules');
  if (existsSync(realModules)) {
    // 'junction' needs no administrator rights on Windows and is ignored elsewhere.
    symlinkSync(realModules, join(api, 'node_modules'), 'junction');
  } else {
    console.log('Warning: services/api/node_modules is missing, so nothing can run in the copy.');
  }
  const realClient = join(API_ROOT, GENERATED_CLIENT);
  if (existsSync(realClient)) {
    cpSync(realClient, join(api, GENERATED_CLIENT), { recursive: true });
  } else {
    console.log('Warning: the generated Prisma client is missing (pnpm db:generate), so the copy may not compile.');
  }

  console.log(`Scratch copy of ${commit.slice(0, 10)}:`);
  console.log(api);
  console.log('Run commands from that folder, for one spec at a time:');
  console.log('  node --experimental-vm-modules ./node_modules/jest/bin/jest.js <path to spec> --runInBand');
  console.log('Editing files there is allowed: it is the only place the review may edit.');
  console.log(`Remove it when done: node .claude/skills/api-review/scripts/scratch-worktree.mjs remove "${folder}"`);
}

/** Deletes a link without ever following it: never recursive. */
function removeLink(path) {
  let stats;
  try {
    stats = lstatSync(path);
  } catch {
    return;
  }
  if (!stats.isSymbolicLink()) {
    fail(`${path} is a real folder, not the link this script made. Nothing was removed.`);
  }
  try {
    unlinkSync(path);
  } catch {
    rmdirSync(path);
  }
}

function remove(given) {
  if (given === undefined) fail('usage: scratch-worktree.mjs remove <folder>');
  let folder = resolve(given);
  // Accept the services/api folder inside the copy as well as the copy itself.
  while (dirname(folder) !== SCRATCH_HOME && folder.startsWith(SCRATCH_HOME + sep)) {
    folder = dirname(folder);
  }
  if (dirname(folder) !== SCRATCH_HOME) {
    fail(`${given} is not inside ${SCRATCH_HOME}: this script removes only the copies it made.`);
  }
  if (!existsSync(folder)) fail(`${folder} does not exist.`);

  removeLink(join(folder, API_PREFIX, 'node_modules'));
  git(['worktree', 'remove', '--force', folder]);
  git(['worktree', 'prune']);
  if (!existsSync(join(API_ROOT, 'node_modules', '.bin'))) {
    fail('The real node_modules looks damaged after the removal: run `pnpm install --frozen-lockfile`.');
  }
  console.log(`Removed ${folder}. The working tree was never touched.`);
}

function list() {
  const present = existsSync(SCRATCH_HOME) ? readdirSync(SCRATCH_HOME) : [];
  if (present.length === 0) {
    console.log('No scratch copies.');
    return;
  }
  for (const name of present) console.log(join(SCRATCH_HOME, name));
}

const [action, argument] = process.argv.slice(2);
if (action === 'create') create(argument ?? 'HEAD');
else if (action === 'remove') remove(argument);
else if (action === 'list') list();
else fail('usage: scratch-worktree.mjs create [ref] | remove <folder> | list');
