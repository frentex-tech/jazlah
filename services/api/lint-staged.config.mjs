// What the pre-commit hook (.husky/pre-commit) runs on staged files under services/api/.
// lint-staged picks only the staged files inside this folder and adds the fixes to the
// commit. Files in .prettierignore (generated: openapi.json, the lockfile) are skipped.
import { relative } from 'node:path';

const quote = (files) => files.map((file) => `"${file}"`).join(' ');

/** ESLint covers what `pnpm lint` covers: src/ and test/. The lint fixtures break rules on purpose. */
const isLinted = (file) =>
  /^(src|test)[\\/]/.test(relative(import.meta.dirname, file));

export default {
  '*.ts': (files) => {
    const linted = files.filter(isLinted);
    return [
      ...(linted.length > 0
        ? [`eslint --fix --max-warnings 0 ${quote(linted)}`]
        : []),
      `prettier --write ${quote(files)}`,
    ];
  },
  '*.{json,yml,yaml,md}': (files) => `prettier --write ${quote(files)}`,
};
