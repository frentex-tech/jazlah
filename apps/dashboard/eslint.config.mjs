import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

// RTL rule: spacing and position use logical utilities only (ms-/me-/ps-/pe-/start-/end-/text-start/text-end/rounded-s-/border-s-).
const PHYSICAL = String.raw`(^|\s|:)-?(ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|text-left|text-right|float-left|float-right|scroll-ml|scroll-mr)(-|\s|$)`;
const message = 'Use logical utilities (ms-, me-, ps-, pe-, start-, end-, text-start, text-end, rounded-s-, border-s-) so RTL works.';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'src/api/schema.d.ts', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=/${PHYSICAL}/]`, message },
        { selector: `TemplateElement[value.raw=/${PHYSICAL}/]`, message },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Mocks are reached only through src/lib/mock-backends.ts, so a production build leaves them out (README «Builds»).
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/*.mock', '@/features/mocks'], message: 'Use mockBackends() from @/lib/mock-backends.' }] },
      ],
    },
  },
  { files: ['src/features/mocks.ts', 'src/features/**/*.mock.ts'], rules: { 'no-restricted-imports': 'off' } },
];
export default config;
