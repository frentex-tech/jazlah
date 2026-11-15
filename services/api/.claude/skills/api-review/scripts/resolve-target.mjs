#!/usr/bin/env node
/**
 * Works out what `/api-review [target]` reviews, and prints it for the reviewer.
 *
 *   node resolve-target.mjs                 the current branch
 *   node resolve-target.mjs 234             a pull request, by number or URL
 *   node resolve-target.mjs feature/x       a branch
 *   node resolve-target.mjs a..b | a...b    a git range
 *   node resolve-target.mjs src/modules/x   a path (file or folder)
 *
 * The base is never assumed to be develop: pull requests here are stacked, so the base
 * is the pull request's own base branch (asked from GitHub with `gh`). Only a branch
 * without a pull request falls back to develop. The comparison is from the merge base,
 * so commits that landed on the base after the branch was cut are not reviewed.
 *
 * A stack can also exist in the history alone: a branch cut from another open pull
 * request's branch, with both pull requests based on develop. Then the comparison starts
 * at the nearest such pull request's head, so each pull request is reviewed once, and
 * the output says so. Pass a range to review more.
 *
 * Read-only: it runs `git fetch` (remote-tracking refs only), `git` queries and
 * `gh pr view|list`. It changes no file, no branch and no index. Paths under
 * services/api are printed relative to services/api, as the project writes them.
 *
 * No dependencies; the working directory does not matter.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** services/api: this file is at .claude/skills/api-review/scripts/ inside it. */
const API_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
/** The base of a branch that has no pull request. */
const DEFAULT_BASE = 'develop';
const MAX_COMMITS_LISTED = 60;
const PR_FIELDS = 'number,title,url,state,isDraft,baseRefName,headRefName,headRefOid';

/** Where commands run: services/api until the repository root is known, then the root. */
let workingFolder = API_ROOT;

function run(command, args, { allowFailure = false } = {}) {
  try {
    return execFileSync(command, args, {
      cwd: workingFolder,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    }).trim();
  } catch (error) {
    if (allowFailure) return null;
    const detail = String(error.stderr ?? error.message).trim();
    throw new Error(`${command} ${args.join(' ')} failed: ${detail}`);
  }
}

const git = (args, options) => run('git', args, options);

function fail(message) {
  console.error(`Cannot resolve the review target: ${message}`);
  console.error(
    'Accepted: nothing (the current branch), a pull request number or URL, a branch, a git range (a..b), or a path.',
  );
  process.exit(1);
}

const REPO_ROOT = resolve(git(['rev-parse', '--show-toplevel']));
workingFolder = REPO_ROOT;
/** `services/api`, as git writes it. */
const API_PREFIX = relative(REPO_ROOT, API_ROOT).replace(/\\/g, '/');

function commitOf(ref) {
  return git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { allowFailure: true });
}

/** The pull request for a number, URL or branch, or null. Needs `gh`; null without it. */
function findPullRequest(selector, { byBranch = false } = {}) {
  if (byBranch) {
    const found = run(
      'gh',
      ['pr', 'list', '--head', selector, '--state', 'all', '--limit', '20', '--json', PR_FIELDS],
      { allowFailure: true },
    );
    if (found === null) return null;
    const list = JSON.parse(found);
    return list.find((pr) => pr.state === 'OPEN') ?? list[0] ?? null;
  }
  const args = ['pr', 'view', '--json', PR_FIELDS];
  if (selector !== null) args.splice(2, 0, selector);
  const found = run('gh', args, { allowFailure: true });
  return found === null ? null : JSON.parse(found);
}

/** The freshest ref for a branch name: the remote-tracking one when it exists. */
function refOfBranch(name) {
  if (commitOf(`origin/${name}`) !== null) return `origin/${name}`;
  if (commitOf(name) !== null) return name;
  return null;
}

function describePullRequest(pr) {
  const state = pr.isDraft ? `${pr.state}, draft` : pr.state;
  return `pull request #${pr.number} "${pr.title}" (${state.toLowerCase()}) ${pr.url}`;
}

/** Parses the argument into { label, base, head, notes } or { label, path, ... }. */
function resolveTarget(argument) {
  const notes = [];
  const fetched = git(['fetch', '--quiet', 'origin'], { allowFailure: true });
  if (fetched === null) notes.push('`git fetch origin` failed: refs may be out of date.');

  const fromPullRequest = (pr, headRef) => {
    const base = refOfBranch(pr.baseRefName);
    if (base === null) fail(`the base branch ${pr.baseRefName} of #${pr.number} is not known locally.`);
    if (pr.baseRefName !== DEFAULT_BASE) {
      notes.push(
        `Stacked: this pull request's base is ${pr.baseRefName}, not ${DEFAULT_BASE}. Only its own commits are under review; read the base's code as context, and report a problem there only where this change depends on it.`,
      );
    }
    return { label: describePullRequest(pr), base, head: headRef, notes };
  };

  if (argument === '') {
    const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    const pr = findPullRequest(null);
    if (pr !== null && pr.headRefName === branch) return fromPullRequest(pr, 'HEAD');
    const base = refOfBranch(DEFAULT_BASE);
    if (base === null) fail(`no pull request for ${branch}, and ${DEFAULT_BASE} is not known locally.`);
    notes.push(`No pull request found for ${branch}: compared with ${DEFAULT_BASE}.`);
    return { label: `the current branch ${branch}`, base, head: 'HEAD', notes };
  }

  const pullRequestNumber =
    /^#?(\d+)$/.exec(argument)?.[1] ?? /\/pull\/(\d+)(?:[/?#].*)?$/.exec(argument)?.[1];
  if (pullRequestNumber !== undefined) {
    const pr = findPullRequest(pullRequestNumber);
    if (pr === null) fail(`pull request ${pullRequestNumber} was not found (is \`gh\` signed in?).`);
    if (commitOf(pr.headRefOid) === null) {
      git(['fetch', '--quiet', 'origin', `pull/${pr.number}/head`], { allowFailure: true });
    }
    if (commitOf(pr.headRefOid) === null) {
      fail(`the head commit ${pr.headRefOid} of #${pr.number} could not be fetched.`);
    }
    return fromPullRequest(pr, pr.headRefOid);
  }

  if (argument.includes('..')) {
    const threeDots = argument.includes('...');
    const [left, right] = argument.split(threeDots ? '...' : '..');
    const head = right === '' ? 'HEAD' : right;
    if (commitOf(left) === null) fail(`${left} is not a commit.`);
    if (commitOf(head) === null) fail(`${head} is not a commit.`);
    notes.push(
      threeDots
        ? 'Three-dot range: compared from the merge base of the two sides.'
        : 'Two-dot range: compared from the left side exactly as given.',
    );
    return { label: `the range ${argument}`, base: left, head, exactBase: !threeDots, notes };
  }

  const asPath = [resolve(process.cwd(), argument), resolve(API_ROOT, argument)].find((candidate) =>
    existsSync(candidate),
  );
  if (asPath !== undefined) {
    const pr = findPullRequest(null);
    const base = refOfBranch(pr?.baseRefName ?? DEFAULT_BASE);
    notes.push(
      'Path target: review every file under the path as it stands, not only what changed. The list below marks what this branch changed there.',
    );
    return {
      label: `the path ${relative(API_ROOT, asPath).replace(/\\/g, '/') || '.'}`,
      base,
      head: 'HEAD',
      path: relative(REPO_ROOT, asPath).replace(/\\/g, '/'),
      notes,
    };
  }

  const branchRef = refOfBranch(argument);
  if (branchRef !== null) {
    const pr = findPullRequest(argument, { byBranch: true });
    if (pr !== null) return fromPullRequest(pr, branchRef);
    const base = refOfBranch(DEFAULT_BASE);
    if (base === null) fail(`${DEFAULT_BASE} is not known locally.`);
    notes.push(`No pull request found for ${argument}: compared with ${DEFAULT_BASE}.`);
    return { label: `the branch ${argument}`, base, head: branchRef, notes };
  }

  return fail(`"${argument}" is not a pull request, a branch, a range or an existing path.`);
}

/**
 * The open pull request this target is built on, when its commits are inside the range:
 * the one whose head is an ancestor of the target's head and nearest to it. Null when
 * there is none, or without `gh`.
 */
function findPullRequestBelow(mergeBase, headCommit) {
  const found = run('gh', ['pr', 'list', '--state', 'open', '--limit', '100', '--json', PR_FIELDS], {
    allowFailure: true,
  });
  if (found === null) return null;
  let nearest = null;
  for (const pr of JSON.parse(found)) {
    const below = commitOf(pr.headRefOid);
    if (below === null || below === headCommit || below === mergeBase) continue;
    const isAncestor = (older, newer) =>
      git(['merge-base', '--is-ancestor', older, newer], { allowFailure: true }) !== null;
    if (!isAncestor(below, headCommit) || !isAncestor(mergeBase, below)) continue;
    const distance = Number(git(['rev-list', '--count', `${below}..${headCommit}`]));
    if (nearest === null || distance < nearest.distance) nearest = { pr, commit: below, distance };
  }
  return nearest;
}

/**
 * The changed files between two commits (or a commit and the working tree, when `to` is
 * null), each with its status letter, added and deleted line counts, and former path
 * when renamed.
 */
function listChanges(from, to, path) {
  const range = to === null ? [from] : [from, to];
  const scope = path === undefined ? [] : ['--', path];
  // Counted without rename detection, so every line names one plain path; a renamed
  // file then shows the whole new file as added.
  const counts = new Map();
  for (const line of git(['diff', '--numstat', '--no-renames', ...range, ...scope]).split('\n')) {
    if (line === '') continue;
    const [added, deleted, ...name] = line.split('\t');
    counts.set(name.join('\t'), `+${added} -${deleted}`);
  }
  const changes = [];
  for (const line of git(['diff', '--name-status', '-M', ...range, ...scope]).split('\n')) {
    if (line === '') continue;
    const parts = line.split('\t');
    const file = parts[parts.length - 1];
    const renamedFrom = parts.length === 3 ? ` (was ${parts[1]})` : '';
    changes.push({ status: parts[0][0], file, detail: `${counts.get(file) ?? ''}${renamedFrom}`.trim() });
  }
  return changes;
}

function printFiles(title, files) {
  console.log(`\n${title} (${files.length}):`);
  if (files.length === 0) console.log('  none');
  for (const { status, file, detail } of files) {
    console.log(`  ${status}  ${file}${detail === '' ? '' : `   ${detail}`}`);
  }
}

const target = resolveTarget(process.argv.slice(2).join(' ').trim());
const headCommit = commitOf(target.head);
const checkedOut = headCommit === commitOf('HEAD');
let mergeBase =
  target.exactBase === true ? commitOf(target.base) : git(['merge-base', target.base, target.head]);
let comparedFrom = target.exactBase === true ? '' : ' (merge base)';
// A range or a path says exactly what to review; anything else is reviewed once per pull request.
if (target.exactBase !== true && target.path === undefined && !target.label.startsWith('the range')) {
  const below = findPullRequestBelow(mergeBase, headCommit);
  if (below !== null) {
    target.notes.push(
      `Stacked in the history: this target contains the commits of open pull request #${below.pr.number} "${below.pr.title}" (${below.pr.headRefName}), which is reviewed on its own. Compared from its head ${below.commit.slice(0, 10)}, not from ${target.base}. Read the code below it as context, and report a problem there only where this change depends on it. To review everything since ${target.base}: /api-review ${mergeBase.slice(0, 10)}..${headCommit.slice(0, 10)}`,
    );
    mergeBase = below.commit;
    comparedFrom = ` (head of #${below.pr.number})`;
  }
}

// When the head is what is checked out, uncommitted work is part of what is reviewed.
const compareTo = checkedOut ? null : target.head;
const changes = listChanges(mergeBase, compareTo, target.path);
const untracked = checkedOut
  ? git(['ls-files', '--others', '--exclude-standard', '--', target.path ?? API_PREFIX], { allowFailure: true })
      ?.split('\n')
      .filter((file) => file !== '')
      .map((file) => ({ status: '?', file, detail: 'untracked' })) ?? []
  : [];
const dirty = checkedOut ? git(['status', '--porcelain']).split('\n').filter((line) => line !== '').length : 0;

const inApi = [];
const outside = [];
for (const change of [...changes, ...untracked]) {
  if (change.file.startsWith(`${API_PREFIX}/`)) {
    inApi.push({ ...change, file: change.file.slice(API_PREFIX.length + 1) });
  } else {
    outside.push(change);
  }
}

console.log(`Review target: ${target.label}`);
console.log(`Base: ${target.base} (${commitOf(target.base).slice(0, 10)})`);
console.log(`Head: ${target.head === headCommit ? '' : `${target.head} `}(${headCommit.slice(0, 10)})`);
console.log(`Compared from: ${mergeBase.slice(0, 10)}${comparedFrom}`);
console.log(
  checkedOut
    ? `Checked out here: yes${dirty > 0 ? `, with ${dirty} uncommitted change(s), which are part of the review` : ', working tree clean'}. Read the files in place.`
    : `Checked out here: NO. The files on disk are another branch. Read this target with \`git show ${headCommit.slice(0, 10)}:${API_PREFIX}/<path>\`, or make a scratch copy: node .claude/skills/api-review/scripts/scratch-worktree.mjs create ${headCommit.slice(0, 10)}`,
);
for (const note of target.notes) console.log(`Note: ${note}`);

const commits = git([
  'log',
  '--oneline',
  '--no-decorate',
  `${mergeBase}..${headCommit}`,
  ...(target.path === undefined ? [] : ['--', target.path]),
])
  .split('\n')
  .filter((line) => line !== '');
console.log(`\nCommits (${commits.length}):`);
for (const commit of commits.slice(0, MAX_COMMITS_LISTED)) console.log(`  ${commit}`);
if (commits.length > MAX_COMMITS_LISTED) console.log(`  ...and ${commits.length - MAX_COMMITS_LISTED} more`);

if (target.path !== undefined) {
  const all = git(['ls-files', '--', target.path]).split('\n').filter((file) => file !== '');
  console.log(`\nEvery tracked file under the path (${all.length}), relative to ${API_PREFIX}/:`);
  for (const file of all) console.log(`  ${file.startsWith(`${API_PREFIX}/`) ? file.slice(API_PREFIX.length + 1) : file}`);
}
printFiles(`Changed in ${API_PREFIX}/, paths relative to it; A added, M modified, D deleted, R renamed, ? untracked`, inApi);
printFiles(`Changed outside ${API_PREFIX}/, paths from the repository root; out of scope except .github/workflows/api-ci.yml`, outside);
console.log(`\nThe diff, when you need a hunk: git diff ${mergeBase.slice(0, 10)}${compareTo === null ? '' : ` ${headCommit.slice(0, 10)}`} -- <path from the repository root>`);
