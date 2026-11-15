# Registry: SMS integration

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **SMS** — `src/integrations/sms/` — one text to one Saudi mobile; logs the provider and masked number, never the text. Providers: `log` (`src/integrations/sms/providers/log.provider.ts`, development only), in order by `SMS_PROVIDERS`; ordered fallback; Msegat pending its documentation (DECISIONS.md). Fake: `src/integrations/sms/providers/fake.provider.ts` via `testing.ts` (R22). [whole folder: reached through index.ts and testing.ts]
- **measureSmsText** — `src/common/sms/measure-sms-text.ts` — an SMS text's encoding and segments; `src/common/sms/gsm-7-alphabet.constants.ts`, `src/common/sms/sms-segment-sizes.constants.ts`, `src/common/sms/sms-encoding.type.ts`, `src/common/sms/sms-text-measure.type.ts`.
