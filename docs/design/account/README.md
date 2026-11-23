# ACC-DES-1 — Account screens

Figma: https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design

Pages: `10 Customer App` (onboarding, phone, OTP, profile, addresses, map, settings, location permission, out of coverage), `20 Customer Web` and `30 Admin` (login and account). Prototype: first-launch flow onboarding → phone → OTP → profile.

## How it is built
- Arabic RTL is the source design; English is derived (see page `99 LTR Rules`).
- Every screen is built from `02 Components` instances; brand and tokens as approved in #14 (PR #205).
- Real photos from `docs/design/reference/`; no placeholder boxes.
- Each section holds the main screen plus its states (loading, empty, error, filled where they apply).
- Scripts: `design/figma/scripts/` (rerunnable, see `design/figma/README.md`); contrast results are registered per text/background pair, 0 failing.

## Review notes
- Wordmark approval from the client and the logo A/B choice are still pending (see #205).
- Dark mode and PNG exports are out of scope for this sprint.
