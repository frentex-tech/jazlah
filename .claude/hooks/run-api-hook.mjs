#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';

const projectDir = process.env.CLAUDE_PROJECT_DIR;
const [hookName, ...hookArgs] = process.argv.slice(2);

if (
  projectDir === undefined ||
  hookName === undefined ||
  basename(hookName) !== hookName
) {
  console.error('Usage: run-api-hook.mjs <hook-file> [hook-args...]');
  process.exit(1);
}

const hookPath = [
  join(projectDir, '.claude', 'hooks', hookName),
  join(projectDir, 'services', 'api', '.claude', 'hooks', hookName),
].find(existsSync);

if (hookPath === undefined) {
  console.error(`Hook not found: ${hookName} under ${projectDir}`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [hookPath, ...hookArgs], {
  stdio: 'inherit',
});

if (result.error !== undefined) {
  console.error(result.error.message);
  process.exit(1);
}

process.exitCode = result.status ?? 1;
