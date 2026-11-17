# Registry: Phone numbers and digits

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **normalizeSaudiMobileNumber** — `src/common/phone/normalize-saudi-mobile-number.ts` — E.164 (`+9665XXXXXXXX`) from typed forms, or null.
- **SaudiMobileNumber** — `src/common/phone/saudi-mobile-number.decorator.ts` — DTO decorator: every form in, E.164 out.
- **maskPhoneNumber** — `src/common/phone/mask-phone-number.ts` — what logs hold instead of a number.
- **toLatinDigits** — `src/common/text/to-latin-digits.ts` — Arabic-Indic digits to Latin.
- **removeFormatCharacters** — `src/common/text/remove-format-characters.ts` — strips invisible format characters (direction marks) from pasted text.
- **escapeLikePattern** — `src/common/text/escape-like-pattern.ts` — escapes `\`, `%`, `_` for a SQL `LIKE` pattern (Prisma's `contains` does not).
