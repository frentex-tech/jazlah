# Jazlah brand assets (DSN-DES-1, batch 4)

Two emblem options. The choice, and the written approval of the «جزلة / Jazlah» wordmark, are **pending the client** (palette and fonts are already approved).

| Option | Emblem | Notes |
|---|---|---|
| A | `emblem-a-shield.svg` | The approved ram in a shield, unchanged. |
| B | `emblem-b-roundel.svg` | The same ram in a round medallion (double gold ring), for a simpler silhouette at small sizes. |

Lockups: `lockup-{a-shield,b-roundel}-{ar,en}.svg`. They use live `<text>` in El Messiri Bold and Readex Pro, so install those fonts to render them correctly; outlined versions come from Figma when the option is chosen. The gold gradient is for the logo only, never for body UI (`docs/design/tokens.json`).

Figma (page `01 Foundations`, section «الشعار · Logo»): lockups on dark and light, app icon (iOS squircle, Android adaptive with safe zone), favicons, splash, for each option.

Figma: [Logo section](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=21-2) · [Option A](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=21-6) · [Option B](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=21-438)

## Update 2026-11-13
The project owner chose a third mark instead of options A and B: the gold profile mark (ram head in side view, `docs/design/reference/prototype/img/mark-gold.png`). The Figma file uses it everywhere (app sign-in and onboarding, web header and footer, dashboard side menu, sign-in panels). Still to do: a vector redraw with lockups, and the client's written approval in `docs/design/signoff.md`.

## Update 2026-11-13 (client logo)
The client supplied the final logo: two gold horns above the Arabic wordmark «جزلة» with a red diamond dot, and «JAZLA» below. It replaces the gold profile mark and options A and B everywhere in the Figma file (365 placements: app sign-in and onboarding, dashboard side menu, sign-in panels, start page, prototype pages). The separate «جزلة» text next to the old mark was hidden, because the logo carries the name.

- `logo-jazla-gold.png`: full logo, transparent background (848×834).
- `mark-jazla-gold.png`: horns only, transparent background (746×345).

Both were cut from a 658×550 screenshot the client sent on a burgundy background, so the edges are not production quality. Still needed from the client: the vector source (SVG or AI). On light backgrounds the Figma file darkens the gold for contrast; the client has not confirmed a light-background version. The Latin spelling in the logo is «JAZLA», while the repo and product name use «Jazlah».

Figma: [Logo section](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=21-2). Options A and B are kept there, dimmed and marked as archive.
