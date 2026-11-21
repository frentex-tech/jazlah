// Jazlah Tailwind preset. Everything here is read from the design files, so a token change needs no component change:
// colors, radii, spacing and shadow from docs/design/tokens.json; text styles from the Figma export (ds/design-system.json).
import tokens from '../../docs/design/tokens.json';
import designSystem from '../../docs/design/spec/ds/design-system.json';

type Token = { value: string | string[] };

const colors = Object.fromEntries(
  Object.entries(tokens.color as Record<string, Token>)
    .filter(([, t]) => typeof t.value === 'string')
    .map(([name, t]) => [name, t.value as string]),
);

// shadcn/ui semantic names mapped onto the same tokens, so components added with `shadcn add` are styled.
const shadcn = {
  background: colors.bg, foreground: colors.ink,
  card: colors.paper, 'card-foreground': colors.ink, popover: colors.paper, 'popover-foreground': colors.ink,
  primary: colors.ember, 'primary-foreground': colors.paper, secondary: colors.sand, 'secondary-foreground': colors.ink,
  accent: colors.sand, 'accent-foreground': colors.ink, 'muted-foreground': colors.muted,
  destructive: colors.danger, 'destructive-foreground': colors.paper, border: colors.line, input: colors.line, ring: colors.ember,
};

const weights: Record<string, number> = { Light: 300, Regular: 400, Medium: 500, Bold: 700, Black: 700 }; // 900 builds as 700

// "Heading/H1" → "h1", "Body/M" → "body-m", "Display/XL" → "display-xl", "Label/M" → "label-m"
const styleKey = (name: string) =>
  name.startsWith('Heading/') ? name.slice(8).toLowerCase() : name.replace('/', '-').toLowerCase();

const fontSize = Object.fromEntries(
  designSystem.textStyles.map((s) => [
    styleKey(s.name),
    [
      `${s.size}px`,
      {
        lineHeight: `${Math.round(s.lineHeight.value) / 100}`,
        fontWeight: String(weights[s.style] ?? 400),
        letterSpacing: s.letterSpacing.value ? `${s.letterSpacing.value / 100}em` : '0',
      },
    ] as [string, { lineHeight: string; fontWeight: string; letterSpacing: string }],
  ]),
);

// Plain object (no tailwindcss import) so this file needs no node_modules of its own.
const preset = {
  theme: {
    colors: { transparent: 'transparent', current: 'currentColor', ...shadcn, ...colors },
    // Text styles set size, line height and weight; Display styles also need `font-display`.
    fontFamily: { body: ['var(--font-body)', 'sans-serif'], display: ['var(--font-display)', 'serif'] },
    extend: {
      fontSize,
      borderRadius: Object.fromEntries(Object.entries(tokens.radius).map(([k, v]) => [k, `${v}px`])),
      boxShadow: { card: tokens.shadow.card },
      spacing: Object.fromEntries(tokens.spacing.scale.map((v) => [`s${v}`, `${v}px`])),
    },
  },
};

export default preset;
