# Registry: Config

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **Typed configuration** — `src/config/` — `AppConfigModule`, `loadEnv` (the only reader of `process.env`), one namespace per area; `findMissingProviderVariables` (`src/config/find-missing-provider-variables.ts`); inject `@Inject(xConfig.KEY)`.
- **Environment schema** — `src/config/env.schema.ts` — a new variable also goes in a namespace and `.env.example`.
- **SMS providers** — `src/config/sms-providers.constants.ts` — names SMS_PROVIDERS may list; variables in `src/config/sms-provider-variables.constants.ts`.
