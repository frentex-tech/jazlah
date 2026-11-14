# common/errors

Belongs here: `AppError`, the one error code list (`error-code.enum.ts`), the message catalogue in Arabic and English (`error-messages.constants.ts`) and the default status of each code (`error-statuses.constants.ts`). Codes are UPPER_SNAKE_CASE; clients branch on them, so a code is never renamed or reused. A new code is added to all three files.

Does not belong: a second error base class, or an integration's own errors (those live in the integration's errors file).
