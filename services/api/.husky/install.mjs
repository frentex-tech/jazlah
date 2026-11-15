// Installs the git hooks in services/api/.husky (husky), from the `prepare` script that
// `pnpm install` runs. The git repository root is two levels up, and husky refuses to
// install into a parent directory itself, so this runs it from the root with the
// subdirectory as the hooks folder (husky's documented setup for a package.json that is
// not at the repository root: `cd .. && husky frontend/.husky`).
//
// Never fails the install. It does nothing:
// - in CI (CI=true): CI runs every check itself;
// - when HUSKY=0 (husky's own switch);
// - when husky is not installed (a production install without dev dependencies);
// - when the repository root has no .git (a tarball or a Docker build context).
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');
const HOOKS_FOLDER = 'services/api/.husky';

if (process.env.CI === 'true') {
  process.exit(0);
}
if (!existsSync(join(REPO_ROOT, '.git'))) {
  console.log('husky: no .git at the repository root, git hooks not installed');
  process.exit(0);
}

let husky;
try {
  husky = (await import('husky')).default;
} catch {
  process.exit(0);
}

process.chdir(REPO_ROOT);
const problem = husky(HOOKS_FOLDER);
if (problem) {
  console.log(`husky: ${problem}`);
}
