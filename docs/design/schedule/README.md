# SCH-DES-1 — Fulfilment and day selection

Figma: https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design

Page `10 Customer App` (checkout step 1, disabled-day reasons) and `20 Customer Web`. Day selection shows unavailable days with the reason.

## How it is built
- Arabic RTL is the source design; English is derived (see page `99 LTR Rules`).
- Every screen is built from `02 Components` instances; brand and tokens as approved in #14 (PR #205).
- Real photos from `docs/design/reference/`; no placeholder boxes.
- Each section holds the main screen plus its states (loading, empty, error, filled where they apply).
- Scripts: `design/figma/scripts/` (rerunnable, see `design/figma/README.md`); contrast results are registered per text/background pair, 0 failing.

## Review notes
- Wordmark approval from the client and the logo A/B choice are still pending (see #205).
- Dark mode and PNG exports are out of scope for this sprint.
