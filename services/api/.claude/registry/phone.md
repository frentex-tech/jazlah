# Registry: Phone numbers and digits

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **normalizeSaudiMobileNumber** — `src/common/phone/normalize-saudi-mobile-number.ts` — E.164 (`+9665XXXXXXXX`) from typed forms, or null.
- **SaudiMobileNumber** — `src/common/phone/saudi-mobile-number.decorator.ts` — DTO decorator: every form in, E.164 out.
- **normalizeSaudiPhoneNumber** — `src/common/phone/normalize-saudi-phone-number.ts` — a contact number, mobile or geographic landline (011 to 017), in E.164, or null; never for sign-in.
- **SaudiPhoneNumber** — `src/common/phone/saudi-phone-number.decorator.ts` — DTO decorator for a contact number: every form in, E.164 out (`isSaudiPhoneNumber`).
- **compactPhoneInput** — `src/common/phone/compact-phone-input.ts` — a typed number without separators or format characters, in Latin digits: what both normalisers match.
- **escapeLikePattern** — `src/common/text/escape-like-pattern.ts` — a user's search term made literal in a LIKE/ILIKE pattern (Prisma `contains`).
- **maskPhoneNumber** — `src/common/phone/mask-phone-number.ts` — what logs hold instead of a number.
- **toLatinDigits** — `src/common/text/to-latin-digits.ts` — Arabic-Indic digits to Latin.
- **removeFormatCharacters** — `src/common/text/remove-format-characters.ts` — strips invisible format characters (direction marks) from pasted text.
