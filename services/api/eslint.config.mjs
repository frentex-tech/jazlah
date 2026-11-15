// @ts-check
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments';
import eslint from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import ts from 'typescript';
import tseslint from 'typescript-eslint';

/*
 * Architecture rules of the JAZLA API.
 *
 * Every rule here has an id (R0 to R21) that appears at the start of its error
 * message (except R0's loose-file check, whose message the plugin fixes) and in
 * `.claude/rules/code-structure.md`, which explains why the rule exists and what to do
 * instead. Each rule is proven by fixtures in
 * `lint-fixtures/`, checked by `pnpm lint:rules`. Changing a rule, an element or a
 * folder means changing the fixtures in the same change (see code-structure.md,
 * "Changing the layout").
 */

/** Where the architecture rules apply: the real source and the fixtures that prove them. */
const SOURCE_FILES = ['src/**/*.ts', 'lint-fixtures/src/**/*.ts'];

/** The one file allowed to read process.env (R11). */
const ENV_READER_FILES = [
  'src/config/load-env.ts',
  'lint-fixtures/src/config/load-env.ts',
];

/**
 * The parts of src/common a module's `domain/` may import (R8), as paths inside
 * src/common. Each is plain TypeScript: no package and no Node core import, which the
 * R8 policy on these files enforces. Everything else in src/common (decorators,
 * filters, pipes, request-id, DTOs) uses Nest or another library and stays out of
 * domain code.
 */
const DOMAIN_SAFE_COMMON = [
  'async/**',
  'errors/**',
  'events/**',
  'i18n/**',
  'money/**',
];

/** The modules that have four layers (DECISIONS.md, "Settled"); R14 gives them no CRUD exception. */
const FOUR_LAYER_MODULES = '{orders,checkout,payments,refunds,wallet,finance}';

/**
 * Packages a file under a module's `domain/` folder may import (R8). Empty: domain
 * code is plain TypeScript. Add a package only if it is pure utility (no I/O, no
 * framework, no global state), with the backend owner's approval, recorded in
 * `.claude/DECISIONS.md`, and with a conforming fixture.
 */
const DOMAIN_ALLOWED_PACKAGES = [];

const SEE = 'See .claude/rules/code-structure.md, section 2.';

/** Element types, by folder under src/. Most specific first: the first match wins. */
const ELEMENTS = [
  { type: 'config', pattern: 'src/config' },
  { type: 'common', pattern: 'src/common' },
  { type: 'infra', pattern: 'src/infra' },
  {
    type: 'integration',
    pattern: 'src/integrations/*',
    capture: ['integration'],
  },
  { type: 'module', pattern: 'src/modules/*', capture: ['module'] },
  // main.ts, app.module.ts and generate-openapi.ts: files directly in src/. (A file in
  // an unknown folder under src/ would also land here: LOOSE_FILES refuses it.)
  { type: 'entry', pattern: 'src' },
];

const from = (...types) => types.map((type) => ({ element: { type } }));
const onlyTypes = (...types) => ({
  element: { types: { anyOf: types } },
});
/** A local element whose type is none of these. External packages never match. */
const otherThan = (...types) => ({
  element: { types: { noneOf: types } },
});
/** The Prisma client (R14): Prisma's packages and the client generated into src/infra/database. */
const PRISMA_CLIENT = [
  { module: { origin: 'external', source: '@prisma/*' } },
  { element: { type: 'infra', fileInternalPath: 'database/generated/**' } },
];
/** The event emitter the event bus wraps (R16). */
const EVENT_EMITTER = {
  module: {
    origin: 'external',
    source: ['@nestjs/event-emitter', 'eventemitter2'],
  },
};
/** Where queues may be registered with @nestjs/bullmq directly (R15): the queue infrastructure. */
const QUEUE_INFRA_FILES = [
  'src/infra/queue/**',
  'lint-fixtures/src/infra/queue/**',
];
/**
 * Names used only inside src/infra/queue (R17): WorkerHost (extend JobProcessor), the
 * queue-events listeners and FlowProducer (with their @nestjs/bullmq helpers). Each would
 * open its own connection outside QueueModule and skip the logging, the bounded add and
 * the shutdown handling the queue infrastructure gives.
 */
const QUEUE_INFRA_ONLY_NAMES =
  '/^(WorkerHost|QueueEvents|QueueEventsHost|QueueEventsListener|OnQueueEvent|FlowProducer|InjectFlowProducer|registerFlowProducer|registerFlowProducerAsync)$/';
const R17_MESSAGE =
  '[R17] WorkerHost, QueueEvents, FlowProducer and their @nestjs/bullmq helpers are used only inside src/infra/queue. A processor extends JobProcessor from @infra/queue/job-processor; queue events and flows need a building block in src/infra/queue first. See .claude/rules/modules.md, "Jobs".';
/** Members of JobProcessor a processor must not redefine (R18). */
const JOB_PROCESSOR_SEALED_MEMBERS = '/^(process|_worker)$/';
const DOMAIN_FILE = {
  element: { type: 'module', fileInternalPath: 'domain/**' },
};
/** The PrismaService class (R14): for infrastructure only, never a module. */
const PRISMA_SERVICE = {
  element: { type: 'infra', fileInternalPath: 'database/prisma.service.ts' },
};

const DEPENDENCY_POLICIES = [
  // What is allowed. The last matching policy wins, so the refusals below override these.
  { allow: { to: { module: { origin: ['external', 'core'] } } } },
  { allow: { dependency: { relationship: { to: 'internal' } } } },
  { from: from('common'), allow: { to: onlyTypes('common', 'config') } },
  { from: from('config'), allow: { to: onlyTypes('config', 'common') } },
  {
    from: from('infra'),
    allow: { to: onlyTypes('config', 'common', 'infra') },
  },
  {
    from: from('integration'),
    allow: { to: onlyTypes('config', 'common', 'infra') },
  },
  {
    from: from('module', 'entry'),
    allow: {
      to: onlyTypes('config', 'common', 'infra', 'integration', 'module'),
    },
  },

  // The refusals, one per rule, each with its own message.
  {
    from: from('common'),
    disallow: { to: otherThan('common', 'config') },
    message: `[R1] src/common may import only from src/common and src/config. It is the bottom layer that everything imports: move code that needs {{to.element.types.[0]}} out of common, or declare an interface in common and implement it there. ${SEE}`,
  },
  {
    from: from('config'),
    disallow: { to: otherThan('config', 'common') },
    message: `[R2] src/config may import only from src/config and src/common. Configuration is read by everything, so it depends on nothing else. ${SEE}`,
  },
  {
    from: from('infra'),
    disallow: { to: otherThan('config', 'common', 'infra') },
    message: `[R3] src/infra may import only from src/config, src/common and src/infra, never from modules or integrations. Let the module publish an event, own its job processor, or push realtime updates through the publishing port. ${SEE}`,
  },
  {
    from: from('integration'),
    disallow: {
      to: [
        otherThan('config', 'common', 'infra', 'integration'),
        {
          element: {
            type: 'integration',
            captured: { integration: '!{{from.element.captured.integration}}' },
          },
        },
      ],
    },
    message: `[R4] An integration may import only src/config, src/common, src/infra and its own folder, never a module or another integration. Take the data in as arguments typed in the integration's types file; let the calling module combine integrations. ${SEE}`,
  },
  {
    from: from('module'),
    disallow: {
      to: otherThan('config', 'common', 'infra', 'integration', 'module'),
    },
    message: `[R5] A module may import only src/config, src/common, src/infra, integrations and modules (never main.ts or app.module.ts). ${SEE}`,
  },
  {
    from: from('module', 'entry'),
    disallow: {
      to: { element: { type: 'integration', fileInternalPath: '!index.ts' } },
    },
    message: `[R6] Import an integration only through its index.ts (@integrations/{{to.element.captured.integration}}), never its providers or other files. Inject the integration's service or port token. ${SEE}`,
  },
  {
    from: from('module'),
    disallow: {
      to: {
        element: {
          type: 'module',
          captured: { module: '!{{from.element.captured.module}}' },
          fileInternalPath: '!index.ts',
        },
      },
    },
    message: `[R7] Import another module only through its index.ts (@modules/{{to.element.captured.module}}). Use what that module exports, or react to its events. ${SEE}`,
  },
  {
    from: from('entry'),
    disallow: {
      to: { element: { type: 'module', fileInternalPath: '!index.ts' } },
    },
    message: `[R7] Import a module only through its index.ts (@modules/{{to.element.captured.module}}). ${SEE}`,
  },
  {
    // Everywhere except: src/infra/database itself, a layered module's infrastructure/,
    // and a CRUD module's service. (domain/ is covered, more strictly, by R8 below.)
    from: [
      ...from('config', 'common', 'integration', 'entry'),
      { element: { type: 'infra', fileInternalPath: '!database/**' } },
      {
        element: {
          type: 'module',
          fileInternalPath: '!{infrastructure/**,*.service.ts}',
        },
      },
      // A four-layer module has no CRUD service: only its infrastructure/.
      {
        element: {
          type: 'module',
          captured: { module: FOUR_LAYER_MODULES },
          fileInternalPath: '!infrastructure/**',
        },
      },
    ],
    disallow: { to: PRISMA_CLIENT },
    message: `[R14] Only a repository (infrastructure/ in a four-layer module) or the root service of a CRUD module may import the Prisma client (@prisma/* or src/infra/database/generated). Inject DbContext there and query through db.client; elsewhere call the repository or service, and open transactions with TransactionRunner. See .claude/rules/database.md.`,
  },
  {
    from: from('module'),
    disallow: { to: PRISMA_SERVICE },
    message: `[R14] A module never imports or injects PrismaService (it is for infrastructure such as readiness). Query through DbContext (db.client) in a repository or CRUD service, and open transactions with TransactionRunner. See .claude/rules/database.md.`,
  },
  {
    // Everywhere except src/infra/event-bus, which wraps the package.
    from: [
      ...from('config', 'common', 'integration', 'module', 'entry'),
      { element: { type: 'infra', fileInternalPath: '!event-bus/**' } },
    ],
    disallow: { to: EVENT_EMITTER },
    message: `[R16] Only src/infra/event-bus may import @nestjs/event-emitter (or eventemitter2). Publish with EventPublisher and subscribe with @OnDomainEvent from @infra/event-bus. ${SEE}`,
  },
  {
    from: DOMAIN_FILE,
    disallow: {
      to: [
        // any package or Node core module (except DOMAIN_ALLOWED_PACKAGES, below)
        { module: { origin: ['external', 'core'] } },
        // config, infra, integrations, entry files
        otherThan('common', 'module'),
        // the parts of src/common that use a framework or a library
        {
          element: {
            type: 'common',
            fileInternalPath: `!{${DOMAIN_SAFE_COMMON.join(',')}}`,
          },
        },
        // a DTO, even in a plain folder: it carries Swagger decorators
        { element: { type: 'common', fileInternalPath: '**/*.dto.ts' } },
        // the module's own api/, application/, infrastructure/ or root files
        { element: { type: 'module', fileInternalPath: '!domain/**' } },
        // any other module, even through its index.ts
        {
          element: {
            type: 'module',
            captured: { module: '!{{from.element.captured.module}}' },
          },
        },
      ],
    },
    message: `[R8] Code under domain/ imports only its own module's domain/ and the plain parts of src/common (${DOMAIN_SAFE_COMMON.join(', ')}): no NestJS, Prisma or other package, no decorator, filter or pipe, and not api/, application/ or infrastructure/. Declare a port in domain/ and implement it in infrastructure/. ${SEE}`,
  },
  {
    // What makes the list above safe: those parts of src/common import no package.
    from: [
      {
        element: {
          type: 'common',
          fileInternalPath: `{${DOMAIN_SAFE_COMMON.join(',')}}`,
        },
      },
    ],
    disallow: { to: { module: { origin: ['external', 'core'] } } },
    message: `[R8] This part of src/common is imported by domain code, so it is plain TypeScript: no package and no Node core module. Move code that needs one to another folder of src/common. ${SEE}`,
  },
  ...(DOMAIN_ALLOWED_PACKAGES.length > 0
    ? [
        {
          from: DOMAIN_FILE,
          allow: {
            to: {
              module: { origin: 'external', source: DOMAIN_ALLOWED_PACKAGES },
            },
          },
        },
      ]
    : []),
];

/** Where @Throttle and @SkipThrottle may be used (R19): the rate limit infrastructure. */
const RATE_LIMIT_INFRA_FILES = [
  'src/infra/rate-limit/**',
  'lint-fixtures/src/infra/rate-limit/**',
];
/**
 * Files that belong to no element (R0): directly in src/modules or src/integrations
 * (outside any module or integration), or in a top-level folder of src/ that is not
 * one of the elements. Matched by path, so the file is refused even with no import.
 */
const LOOSE_FILES = [
  '{src,lint-fixtures/src}/{modules,integrations}/*.ts',
  '{src,lint-fixtures/src}/!(config|common|infra|integrations|modules)/**/*.ts',
];
/** Unit tests: R21 does not apply to their test doubles. */
const SPEC_FILES = ['**/*.spec.ts'];
/** Business modules, where R20 applies. */
const MODULE_FILES = ['src/modules/**', 'lint-fixtures/src/modules/**'];

const R11_MESSAGE =
  '[R11] Only src/config/load-env.ts reads process.env. Inject a typed config namespace (@config/...) instead; a new variable goes in src/config/env.schema.ts.';
const R15_MESSAGE =
  '[R15] Register a queue with QueueRegistrationModule.register(...) from @infra/queue/queue-registration.module, never BullModule.registerQueue: it attaches the error listener and makes the queue a BoundedQueue. See .claude/rules/modules.md, "Jobs".';
const R19_MESSAGE =
  '[R19] Use @RateLimit and @SkipRateLimit from @infra/rate-limit, never @Throttle or @SkipThrottle from @nestjs/throttler: the library decorators bypass our counter names, keys, startup checks and failClosed. See .claude/rules/http.md.';
const R20_MESSAGE =
  '[R20] No Prisma *OrThrow method in a module: its failed query ends the transaction. Use findUnique or findFirst, check for null, and throw AppError NOT_FOUND. See .claude/rules/database.md.';
const REGISTER_QUEUE = '/^registerQueue(Async)?$/';

/**
 * The no-restricted-syntax entries of each rule. ESLint keeps one option list per rule
 * and file, so an area exempt from one rule gets the list without it (`syntax`).
 */
const SYNTAX = {
  // R11: process.env reached through another object (globalThis.process.env).
  R11: [
    {
      selector:
        "MemberExpression[property.name='env'][object.type='MemberExpression'][object.property.name='process']",
      message: R11_MESSAGE,
    },
  ],
  // R15: the name itself, however it is reached: BullModule.registerQueue,
  // BullModule['registerQueue'], a destructured or renamed registerQueue, Reflect.get.
  // A name built at run time ('register' + 'Queue') is a review rule.
  R15: [
    { selector: `Identifier[name=${REGISTER_QUEUE}]`, message: R15_MESSAGE },
    { selector: `Literal[value=${REGISTER_QUEUE}]`, message: R15_MESSAGE },
    {
      selector: `TemplateElement[value.raw=${REGISTER_QUEUE}]`,
      message: R15_MESSAGE,
    },
  ],
  // R17: the BullMQ building blocks that bypass the queue infrastructure, imported or
  // reached through a namespace.
  R17: [
    {
      selector: `ImportSpecifier[imported.name=${QUEUE_INFRA_ONLY_NAMES}]`,
      message: R17_MESSAGE,
    },
    {
      selector: `MemberExpression[property.name=${QUEUE_INFRA_ONLY_NAMES}]`,
      message: R17_MESSAGE,
    },
  ],
  // R18: a processor does not override what JobProcessor does around every job.
  R18: [
    {
      selector: `:matches(ClassDeclaration, ClassExpression)[superClass.name='JobProcessor'] > ClassBody > :matches(MethodDefinition, PropertyDefinition)[key.name=${JOB_PROCESSOR_SEALED_MEMBERS}]`,
      message:
        '[R18] A job processor implements handle(job, signal) only: never override process (or replace _worker), which JobProcessor uses to cancel jobs on shutdown and around which the job logging is built. See .claude/rules/modules.md, "Jobs".',
    },
  ],
  // R19: the throttler decorators reached through a namespace import's member.
  R19: [
    {
      selector: 'MemberExpression[property.name=/^(Throttle|SkipThrottle)$/]',
      message: R19_MESSAGE,
    },
  ],
  // R20: Prisma's throwing finders, called or destructured.
  R20: [
    {
      selector: 'MemberExpression[property.name=/OrThrow$/]',
      message: R20_MESSAGE,
    },
    {
      selector: 'ObjectPattern > Property[key.name=/OrThrow$/]',
      message: R20_MESSAGE,
    },
  ],
};
const syntax = (...ids) => ['error', ...ids.flatMap((id) => SYNTAX[id])];

/** no-restricted-imports entries: R11 (process.env through an import) and R19. */
const R11_IMPORTS = ['process', 'node:process'].map((name) => ({
  name,
  importNames: ['env', 'default'],
  message: R11_MESSAGE,
}));
const R19_IMPORTS = [
  {
    name: '@nestjs/throttler',
    importNames: ['Throttle', 'SkipThrottle'],
    message: R19_MESSAGE,
  },
];
const imports = (...lists) => ['error', { paths: lists.flat() }];

/**
 * R21: a type assertion from `any` or `unknown` to a concrete type. Such a value
 * comes from outside the compiler's knowledge (JSON.parse, a request body, a caught
 * error), so it is validated or narrowed, never asserted: `x as Order` claims a shape
 * nobody checked, and `x as unknown as Order` launders any value. Asserting to
 * `unknown` and `as const` are allowed.
 */
const noAssertionFromUnknown = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      fromUnknown:
        '[R21] Do not assert a value of type {{source}} to {{target}}: validate it (a zod schema, a class-validator DTO) or narrow it with a type guard. A value from outside the program is checked, not asserted. See .claude/rules/invariants.md, "Type safety".',
    },
  },
  create(context) {
    const services = context.sourceCode.parserServices;
    const checker = services.program.getTypeChecker();
    const check = (node) => {
      const target = node.typeAnnotation;
      if (
        target.type === 'TSUnknownKeyword' ||
        target.type === 'TSAnyKeyword' ||
        (target.type === 'TSTypeReference' &&
          target.typeName.type === 'Identifier' &&
          target.typeName.name === 'const')
      ) {
        return;
      }
      const source = checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(node.expression),
      );
      if (source.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        context.report({
          node,
          messageId: 'fromUnknown',
          data: {
            source: checker.typeToString(source),
            target: context.sourceCode.getText(target),
          },
        });
      }
    };
    return { TSAsExpression: check, TSTypeAssertion: check };
  },
};
const jazla = { rules: { 'no-assertion-from-unknown': noAssertionFromUnknown } };

/**
 * Rules a comment may never disable (R12): the boundaries (R0 to R8 and R14), R9 and
 * R10, and the rules that carry R11 and R15 to R21.
 */
const NEVER_DISABLED = [
  'boundaries/*',
  '@typescript-eslint/no-explicit-any',
  '@typescript-eslint/no-unsafe-*',
  '@typescript-eslint/ban-ts-comment',
  'no-restricted-properties',
  'no-restricted-imports',
  'no-restricted-syntax',
  'jazla/*',
];

export default tseslint.config(
  {
    // The generated Prisma client is tool output (`pnpm db:generate`), not code we write.
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'coverage/**',
      'src/infra/database/generated/**',
    ],
  },
  {
    linterOptions: { reportUnusedDisableDirectives: 'error' },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: { '@eslint-community/eslint-comments': eslintComments },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // R9: no any, and nothing unsafe done with an any.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // R10: @ts-ignore and @ts-nocheck are banned; @ts-expect-error needs a description.
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 5,
        },
      ],

      // R11: only src/config/load-env.ts reads process.env (directly, destructured,
      // imported from 'process' or reached through globalThis).
      'no-restricted-properties': [
        'error',
        { object: 'process', property: 'env', message: R11_MESSAGE },
      ],
      'no-restricted-imports': imports(R11_IMPORTS, R19_IMPORTS),

      // R12: a disable comment covers one line (-next-line or -line, never a block or
      // the file), names its rules, says why ("-- reason") and never names a rule in
      // NEVER_DISABLED. An unused disable comment is an error too (linterOptions).
      '@eslint-community/eslint-comments/require-description': 'error',
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/no-use': [
        'error',
        { allow: ['eslint-disable-next-line', 'eslint-disable-line'] },
      ],
      '@eslint-community/eslint-comments/no-restricted-disable': [
        'error',
        ...NEVER_DISABLED,
      ],

      // R13: no floating promises (console is covered for src/ below).
      '@typescript-eslint/no-floating-promises': 'error',

      // R11, R15, R17, R18 and R19 (modules add R20, below).
      'no-restricted-syntax': syntax('R11', 'R15', 'R17', 'R18', 'R19'),
    },
  },
  {
    files: ENV_READER_FILES,
    rules: { 'no-restricted-properties': 'off' },
  },
  {
    // The queue infrastructure registers queues and wraps WorkerHost (R15, R17).
    files: QUEUE_INFRA_FILES,
    rules: { 'no-restricted-syntax': syntax('R11', 'R18', 'R19') },
  },
  {
    // The rate limit infrastructure wraps the throttler decorators (R19).
    files: RATE_LIMIT_INFRA_FILES,
    rules: {
      'no-restricted-syntax': syntax('R11', 'R15', 'R17', 'R18'),
      'no-restricted-imports': imports(R11_IMPORTS),
    },
  },
  {
    files: MODULE_FILES,
    rules: {
      'no-restricted-syntax': syntax('R11', 'R15', 'R17', 'R18', 'R19', 'R20'),
    },
  },
  {
    // R0 to R8 and R14 (folder boundaries), R21, and the console half of R13.
    files: SOURCE_FILES,
    plugins: { boundaries, jazla },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          // The fixtures have their own tsconfig, so their aliases resolve inside lint-fixtures/.
          project: ['./tsconfig.json', './lint-fixtures/tsconfig.json'],
          noWarnOnMultipleProjects: true,
        },
      },
      'boundaries/elements': ELEMENTS,
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          // Also check imports of packages (for R8), imports inside one element (for
          // R8's own-module layers) and local files outside every element.
          checkAllOrigins: true,
          checkInternals: true,
          checkUnknownLocals: true,
          message: `[R0] No architecture rule allows {{from.element.types.[0]}} to import "{{dependency.source}}". Every import from src/ must fit the folder rules. ${SEE}`,
          policies: DEPENDENCY_POLICIES,
        },
      ],
      'jazla/no-assertion-from-unknown': 'error',
      // R13: the application logger is used instead of console.
      'no-console': 'error',
    },
  },
  {
    // A unit test builds partial test doubles (`{ ... } as unknown as RedisService`):
    // typed fakes written in the test, not values from outside the program (R21).
    files: SPEC_FILES,
    rules: { 'jazla/no-assertion-from-unknown': 'off' },
  },
  {
    // R0: every file under src/ belongs to an element. Last, so it wins for these paths.
    files: LOOSE_FILES,
    rules: {
      'no-restricted-syntax': [
        ...syntax('R11', 'R15', 'R17', 'R18', 'R19', 'R20'),
        {
          selector: 'Program',
          message: `[R0] This file belongs to no element: a file directly in src/modules or src/integrations goes inside a module or integration folder, and src/ has only config, common, infra, integrations, modules and the entry files. ${SEE}`,
        },
      ],
    },
  },
);
