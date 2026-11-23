# packages/config

`tailwind-preset.ts`: the Jazlah design tokens as a Tailwind preset (APP-WEB-1), used by `apps/dashboard`.

- Colors, radii (`rounded-lg|md|sm|pill`), spacing (`*-s4` … `*-s48`) and `shadow-card` come from `docs/design/tokens.json`.
- Text styles (`text-display-xl`, `text-h1`, `text-h2`, `text-h3`, `text-body-l`, `text-body-m`, `text-label-m`, `text-caption`) come from the Figma export `docs/design/spec/ds/design-system.json` and set size, line height and weight. Display styles also take `font-display`.
- Fonts are CSS variables (`--font-body`, `--font-display`) that the app fills with `next/font` (Readex Pro, El Messiri; see tokens.json `font.*.family`).
