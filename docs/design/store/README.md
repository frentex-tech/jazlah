# STF-DES-1 — Storefront screens

Figma: https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design

Page `10 Customer App` (home, category list, store page, product detail with price-breakdown sheet, search and filters) and `20 Customer Web`. Prototype: Home → product → add to cart → checkout (regular order, 6 steps max).

## How it is built
- Arabic RTL is the source design; English is derived (see page `99 LTR Rules`).
- Every screen is built from `02 Components` instances; brand and tokens as approved in #14 (PR #205).
- Real photos from `docs/design/reference/`; no placeholder boxes.
- Each section holds the main screen plus its states (loading, empty, error, filled where they apply).
- Scripts: `design/figma/scripts/` (rerunnable, see `design/figma/README.md`); contrast results are registered per text/background pair, 0 failing.

## Review notes
- Wordmark approval from the client and the logo A/B choice are still pending (see #205).
- Dark mode and PNG exports are out of scope for this sprint.
