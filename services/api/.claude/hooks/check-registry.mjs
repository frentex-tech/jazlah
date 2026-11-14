#!/usr/bin/env node
/**
 * Checks .claude/REGISTRY.md against the code.
 *
 *   node .claude/hooks/check-registry.mjs               manual or CI: prints problems, exits 1 if any
 *   node .claude/hooks/check-registry.mjs --stop-hook   Claude Code Stop hook (wired in .claude/settings.json)
 *
 * Checks:
 *   1. Every path listed below the entries marker in REGISTRY.md exists.
 *   2. No listed path is a whole shared area (that would make check 3 meaningless).
 *   3. Every source file in a shared folder is covered by an entry: a line naming the
 *      file itself, or a line naming a folder above it that declares itself as covering
 *      the folder's whole contents, with a reason: `[whole folder: <reason>]` on the
 *      same line. A folder named without that declaration covers nothing.
 *   4. The declaration is used only on a folder line, and its reason is not empty.
 *
 * No dependencies. Paths are resolved from this file's location, so the
 * working directory does not matter.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const REGISTRY_FILE = join(API_ROOT, '.claude', 'REGISTRY.md');
const ENTRIES_MARKER = '<!-- entries-start';

/** Folders (relative to services/api) whose source files must each be covered by a registry line. */
const SHARED_ROOTS = ['src/common', 'src/infra', 'src/integrations'];

/** A backticked token in the registry is treated as a path when it starts with one of these. */
const PATH_PREFIXES = ['src/'];

/** Registering one of these would cover a whole area with a single line. */
const TOO_BROAD = new Set(['src/', 'src/common/', 'src/infra/', 'src/integrations/', 'src/modules/']);

// `generated`: code written by tools (the Prisma client), not shared building blocks.
const SKIPPED_FOLDERS = new Set(['node_modules', 'dist', 'coverage', 'generated']);
const MAX_LISTED = 25;
/** On an entry line, after a folder path: the folder's whole contents are covered, for the reason given. */
const WHOLE_FOLDER = /\[whole folder: ([^\]]*)\]/;
const MIN_REASON_LENGTH = 10;

function isSourceFile(name) {
  if (!name.endsWith('.ts')) return false;
  if (name === 'index.ts') return false;
  return !/\.(spec|test|e2e-spec|d)\.ts$/.test(name);
}

function isFolder(absolutePath) {
  try {
    return statSync(absolutePath).isDirectory();
  } catch {
    return false;
  }
}

/** Source files under a shared root, as forward-slash paths relative to services/api. */
function listSourceFiles(relativeFolder) {
  const absoluteFolder = resolve(API_ROOT, relativeFolder);
  if (!isFolder(absoluteFolder)) return [];
  const found = [];
  for (const entry of readdirSync(absoluteFolder, { withFileTypes: true })) {
    const relativePath = `${relativeFolder}/${entry.name}`;
    if (entry.isDirectory()) {
      if (!SKIPPED_FOLDERS.has(entry.name)) found.push(...listSourceFiles(relativePath));
    } else if (isSourceFile(entry.name)) {
      found.push(relativePath);
    }
  }
  return found;
}

/**
 * The paths listed below the marker, each with whether its line declares the whole
 * folder covered (and the reason given).
 */
function readRegisteredPaths() {
  const text = readFileSync(REGISTRY_FILE, 'utf8');
  const markerAt = text.indexOf(ENTRIES_MARKER);
  if (markerAt === -1) return null;
  const listed = [];
  for (const line of text.slice(markerAt).split(/\r?\n/)) {
    const declaration = WHOLE_FOLDER.exec(line);
    for (const match of line.matchAll(/`([^`\n]+)`/g)) {
      const token = match[1].trim().replace(/\\/g, '/');
      if (!PATH_PREFIXES.some((prefix) => token.startsWith(prefix))) continue;
      listed.push({
        path: token,
        wholeFolder: declaration !== null,
        reason: declaration?.[1].trim() ?? '',
      });
    }
  }
  return listed;
}

/** How many shared source files no entry covers (for the summary line). */
function countUncovered() {
  return findProblems.lastUncovered;
}

function findProblems() {
  if (!existsSync(REGISTRY_FILE)) return ['.claude/REGISTRY.md is missing.'];
  const registered = readRegisteredPaths();
  if (registered === null) {
    return [`.claude/REGISTRY.md has no "${ENTRIES_MARKER} ... -->" marker line. Restore it above the entries.`];
  }

  const problems = [];
  const coveringFiles = new Set();
  const coveringFolders = [];

  for (const { path, wholeFolder, reason } of registered) {
    const asFolder = path.endsWith('/') ? path : `${path}/`;
    const absolutePath = resolve(API_ROOT, path);
    if (TOO_BROAD.has(asFolder)) {
      problems.push(`Too broad: \`${path}\` is a whole area. Register the building blocks inside it, one line each.`);
      continue;
    }
    if (!existsSync(absolutePath)) {
      problems.push(`Stale: \`${path}\` is listed in the registry but does not exist. Correct or remove the line.`);
      continue;
    }
    if (!isFolder(absolutePath)) {
      coveringFiles.add(path);
    } else if (wholeFolder) {
      if (reason.length < MIN_REASON_LENGTH) {
        problems.push(`No reason: the line of \`${path}\` declares the whole folder covered without saying why ("[whole folder: <reason>]").`);
      } else {
        coveringFolders.push(asFolder);
      }
    }
  }

  const uncovered = SHARED_ROOTS.flatMap(listSourceFiles).filter(
    (file) => !coveringFiles.has(file) && !coveringFolders.some((folder) => file.startsWith(folder)),
  );
  for (const file of uncovered.slice(0, MAX_LISTED)) {
    problems.push(`Not registered: \`${file}\` is shared code with no entry naming it, and no folder above it is declared "[whole folder: <reason>]".`);
  }
  findProblems.lastUncovered = uncovered.length;
  if (uncovered.length > MAX_LISTED) {
    problems.push(`...and ${uncovered.length - MAX_LISTED} more unregistered shared files.`);
  }
  return problems;
}

/** True when the working tree has uncommitted changes in shared code or in the registry. */
function sharedCodeHasUncommittedChanges() {
  try {
    const output = execFileSync(
      'git',
      ['-C', API_ROOT, 'status', '--porcelain', '--', ...SHARED_ROOTS, '.claude/REGISTRY.md'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

function readHookInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

function runAsStopHook() {
  const input = readHookInput();
  // Already continuing because of this hook: let the session stop, so it can never loop.
  if (input.stop_hook_active) return 0;
  // Only speak up when this working tree changed shared code or the registry.
  if (!sharedCodeHasUncommittedChanges()) return 0;
  const problems = findProblems();
  if (problems.length === 0) return 0;
  const reason = [
    'The shared-code registry (services/api/.claude/REGISTRY.md) does not match the code:',
    ...problems.map((problem) => `- ${problem}`),
    'Update the registry so the next session can find this code, or tell the user why no change is needed.',
  ].join('\n');
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  return 0;
}

function runAsCommand() {
  const problems = findProblems();
  if (problems.length === 0) {
    console.log('Registry check passed: every listed path exists and every shared source file is named by an entry or inside a folder declared whole.');
    return 0;
  }
  const uncovered = countUncovered();
  console.error(`Registry check failed (${problems.length} problem${problems.length === 1 ? '' : 's'}; ${uncovered} shared file${uncovered === 1 ? '' : 's'} not covered):`);
  for (const problem of problems) console.error(`- ${problem}`);
  return 1;
}

process.exitCode = process.argv.includes('--stop-hook') ? runAsStopHook() : runAsCommand();
