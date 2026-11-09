# Jazlah — Design baseline (approved by the client)

This is the visual direction the client saw and approved before the project was renamed from **Sinam** to **Jazlah**. Every design task builds on it. Don't invent a new direction.

## Brand
- **Feel:** a premium Saudi butcher. Deep **burgundy and gold** on warm cream, in the spirit of the market leader (Turki Dabayeh) but with our own emblem and typography.
- **Colors and fonts:** [`tokens.json`](tokens.json) is the single source for Figma variables, Flutter and Tailwind.
  - Burgundy `#4A1014`, gold `#C99A52`, ember CTA `#8E1F26`
  - cream background `#F7F0E8`, paper `#FFFBF7`, ink `#2A1215`, success `#3F7A4E`
  - **Readex Pro** for UI and **El Messiri** for display
- **Emblem and wordmark** (Sinam version): `reference/prototype/img/emblem.svg`, `logo-gold.png`, `mark-gold.png`, `word-gold.png`. A golden ram in a shield. **DSN-DES-1 redraws the wordmark as «جزلة / Jazlah»** in the same language. Whether to keep the ram emblem is confirmed with the client.

## Interactive prototype (shown to the client)
- Live: https://frentex-tech.github.io/sinam-brand/app/v2/
- Source: [`reference/prototype/v2/`](reference/prototype/v2/). Open `index.html` locally. Images are in `reference/prototype/img/`.
- Screen captures in [`reference/screens/`](reference/screens/): splash, onboarding 1–3, login, home, product, cart, track, points, Sahm Al-Khair, story view, account.

## What carries over and what changes
| Carries over as-is | Changes for Jazlah |
|---|---|
| Palette, fonts, radii, shadows, photo style (dark, warm meat photography) | Name and wordmark (Sinam → Jazlah) |
| Home structure (location header, banners, categories, best sellers) | Multi-vendor: a "partner stores" rail, the vendor name on product cards, store pages |
| Product customization (size, cut, packaging, exclusions, live total) | New services: occasions, farm visits, cooked dishes, Adha season, feed marketplace + chat |
| Cart, tracking and account patterns | The dashboards (admin / vendor / kitchen) are new, and use the same tokens in a denser layout |
| Points, Sahm Al-Khair and stories screens | Post-launch (keep the designs, implement later) |
