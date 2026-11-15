// Keeps the pre-commit hook from changing what is staged outside its own scope.
//
//   node .husky/staged-guard.mjs record   before lint-staged: the staged paths and their
//                                         index entries
//   node .husky/staged-guard.mjs check    after lint-staged: compare, repair, report
//
// Why: after its tasks, lint-staged stages every file in the repository whose unstaged
// diff changed while the tasks ran, not only the files it was given (lib/gitWorkflow.js,
// updateIndex). That staged a file outside services/api into a commit once. `check`
// fails when, compared with `record`:
// - a path became staged that was not staged before, or
// - a path outside services/api that was staged now has a different index entry.
// Before failing it puts those index entries back as they were, so nothing extra is left
// staged and no working-tree file is touched. Changes lint-staged makes to staged files
// under services/api (ESLint --fix, Prettier) are expected and allowed.
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';

const SCOPE = 'services/api/';

const git = (args, input) =>
  execFileSync('git', args, { encoding: 'utf8', input, maxBuffer: 1 << 28 });
const root = git(['rev-parse', '--show-toplevel']).trim();
const inRoot = (args, input) => git(['-C', root, ...args], input);
const recordFile = git(['rev-parse', '--path-format=absolute', '--git-path', 'husky-staged-guard.json']).trim();

/** Staged paths (index differs from HEAD), relative to the repository root. */
function stagedPaths() {
  return inRoot(['diff', '--cached', '--name-only', '--no-renames', '-z'])
    .split('\0')
    .filter(Boolean);
}

/** The index entry ("<mode> <blob>") of each path, or null when the index has none. */
function indexEntries(paths) {
  const entries = Object.fromEntries(paths.map((path) => [path, null]));
  if (paths.length === 0) return entries;
  const out = inRoot(['ls-files', '--stage', '-z', '--', ...paths.map((p) => `:(literal)${p}`)]);
  for (const line of out.split('\0').filter(Boolean)) {
    const [meta, path] = line.split('\t');
    const [mode, blob] = meta.split(' ');
    entries[path] = `${mode} ${blob}`;
  }
  return entries;
}

/** Puts a path's index entry back as recorded: absent from the index, or mode and blob. */
function restoreEntry(path, entry) {
  if (entry === null) {
    inRoot(['rm', '--cached', '--quiet', '--', `:(literal)${path}`]);
  } else {
    const [mode, blob] = entry.split(' ');
    inRoot(['update-index', '--cacheinfo', `${mode},${blob},${path}`]);
  }
}

function record() {
  const staged = stagedPaths();
  writeFileSync(recordFile, JSON.stringify({ staged: indexEntries(staged) }));
}

function check() {
  const before = JSON.parse(readFileSync(recordFile, 'utf8')).staged;
  rmSync(recordFile, { force: true });
  const after = stagedPaths();

  const newlyStaged = after.filter((path) => !(path in before));
  const outsideNow = indexEntries(Object.keys(before).filter((p) => !p.startsWith(SCOPE)));
  const changedOutside = Object.keys(outsideNow).filter((p) => outsideNow[p] !== before[p]);
  if (newlyStaged.length === 0 && changedOutside.length === 0) return;

  // What these paths' index entries were before the hook: HEAD's for a path that was
  // not staged (it matched HEAD), the recorded entry for a staged path outside the scope.
  const headEntries = Object.fromEntries(
    newlyStaged.map((path) => {
      const line = inRoot(['ls-tree', '-z', 'HEAD', '--', `:(literal)${path}`]).split('\0')[0];
      if (!line) return [path, null];
      const [meta] = line.split('\t');
      const [mode, , blob] = meta.split(' ');
      return [path, `${mode} ${blob}`];
    }),
  );
  for (const path of newlyStaged) restoreEntry(path, headEntries[path]);
  for (const path of changedOutside) restoreEntry(path, before[path]);

  const lines = [
    'pre-commit: the hook changed what is staged outside its scope, so the commit is stopped.',
    ...newlyStaged.map((p) => `  became staged: ${p}`),
    ...changedOutside.map((p) => `  staged file outside services/api changed: ${p}`),
    'Their index entries were put back as they were; working-tree files were not touched.',
    'Check `git status`, stage what you mean to commit, and commit again (never --no-verify).',
  ];
  process.stderr.write(`${lines.join('\n')}\n`);
  process.exitCode = 1;
}

const command = process.argv[2];
if (command === 'record') record();
else if (command === 'check') check();
else {
  process.stderr.write('usage: node .husky/staged-guard.mjs record|check\n');
  process.exitCode = 2;
}
