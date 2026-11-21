import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the preset's custom scales (packages/config/tailwind-preset.ts, docs/design/tokens.json), so a
// later class replaces an earlier one: `rounded-md` beats `rounded-pill`, `px-s24` beats `px-s32`, `text-h1` is a font
// size and not a color. Unknown values are never merged, so the CSS order would pick the winner.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['pill'],
      spacing: ['s4', 's8', 's12', 's16', 's20', 's24', 's32', 's40', 's48'],
      shadow: ['card'],
    },
    classGroups: {
      'font-size': [{ text: ['display-xl', 'display-l', 'h1', 'h2', 'h3', 'body-l', 'body-m', 'label-m', 'caption'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
