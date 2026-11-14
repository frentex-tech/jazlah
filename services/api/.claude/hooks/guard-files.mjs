#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook for Read, Edit and Write (wired in .claude/settings.json).
 *
 * Asks the user for confirmation, with the reason, before:
 *   1. Read, Edit or Write on a real environment file (.env, .env.local, ...).
 *      .env.example is always allowed.
 *   2. Edit or Write on a Prisma migration file that already has commit history.
 *
 * It never blocks outright: the user decides. Anything it does not recognise is
 * left to the normal permission flow. No dependencies.
 */
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { basename, dirname } from 'node:path';

const ALLOWED_ENV_FILES = new Set(['.env.example']);

function askUser(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: reason,
      },
    }),
  );
}

function readHookInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

function isRealEnvFile(fileName) {
  return /^\.env(\..+)?$/.test(fileName) && !ALLOWED_ENV_FILES.has(fileName);
}

function isMigrationFile(filePath) {
  return /\/prisma\/(.+\/)?migrations\//.test(filePath);
}

/** True when git has at least one commit that touches the file. */
function hasCommitHistory(filePath) {
  if (!existsSync(filePath)) return false;
  try {
    const output = execFileSync('git', ['-C', dirname(filePath), 'log', '-1', '--format=%H', '--', basename(filePath)], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output.trim().length > 0;
  } catch {
    return false;
  }
}

const input = readHookInput();
const toolName = input.tool_name;
const rawPath = input.tool_input?.file_path;

if (typeof rawPath === 'string') {
  const filePath = rawPath.replace(/\\/g, '/');
  const fileName = basename(filePath);

  if (isRealEnvFile(fileName)) {
    askUser(
      `${fileName} holds real secrets. Project rule: secrets never enter the repository or the logs, and sessions work from .env.example and the config schema. Approve only if you want this session to open it.`,
    );
  } else if ((toolName === 'Edit' || toolName === 'Write') && isMigrationFile(filePath) && hasCommitHistory(rawPath)) {
    askUser(
      'This Prisma migration is already committed. Project rule: existing migrations are never edited, because environments that ran it would no longer match. The fix is a new migration. Approve only if this migration has not been merged or applied anywhere.',
    );
  }
}
