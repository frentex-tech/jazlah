import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { STUCK_SHUTDOWN_DEADLINE_MS } from './support/stuck-shutdown.constants';

const API_ROOT = join(__dirname, '..');

/** The parsed JSON lines a process wrote to stdout. */
function jsonLines(output: string): Record<string, unknown>[] {
  return output
    .split(/\r?\n/)
    .filter((line) => line.startsWith('{'))
    .map((line): unknown => JSON.parse(line))
    .filter(
      (value): value is Record<string, unknown> =>
        typeof value === 'object' && value !== null,
    );
}

describe('shutdown deadline (a resource that never closes)', () => {
  it('exits with code 1 after the deadline and logs the stuck resource', () => {
    const startedAt = Date.now();
    const child = spawnSync(
      process.execPath,
      [
        '-r',
        'ts-node/register/transpile-only',
        '-r',
        'tsconfig-paths/register',
        join('test', 'support', 'stuck-shutdown.main.ts'),
      ],
      { cwd: API_ROOT, encoding: 'utf8', timeout: 30_000 },
    );
    const elapsedMs = Date.now() - startedAt;
    const deadlineLine = jsonLines(child.stdout).find(
      (line) =>
        line.msg ===
        'Shutdown deadline passed; exiting with resources still closing',
    );

    process.stdout.write(
      `stuck shutdown: exit code ${child.status}, after ${elapsedMs} ms, log line ${JSON.stringify(deadlineLine)}\n`,
    );
    expect(child.status).toBe(1);
    expect(deadlineLine).toEqual({
      level: 'error',
      deadlineMs: STUCK_SHUTDOWN_DEADLINE_MS,
      stillClosing: ['stuck-probe'],
      msg: 'Shutdown deadline passed; exiting with resources still closing',
    });
  });
});
