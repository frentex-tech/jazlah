# Design specs (JSON from Figma)

Exact values read from the live Figma file, so the build does not measure screenshots. Exported 2026-11-18 by `tools/design/figma_export.mjs` (read-only; the file was not changed).

| Folder | What |
|---|---|
| `app/<node-id>.json` | Sprint 1 app screens and their states (ACC-MOB-1, ACC-MOB-3, LOC-MOB-1) + the two English (LTR) examples |
| `dashboard/<node-id>.json` | Sprint 1 dashboard screens: every sign-in screen and state (admin, vendor, kitchen), and one screen per role for the shells (APP-DSH-1) |
| `ds/<node-id>.json` | Every Design System component with all its variants (Button, Input, Phone input, OTP field, Side nav, Top bar, Data table …) |
| `ds/design-system.json` | All 51 variables, 9 text styles, effect styles and the component list |
| `sprint-1.txt`, `sprint-2.txt` | The exported lists: `<node-id> <platform> <task>` (Sprint 2 exported 2026-11-20) |

Reference images for each screen are in [`../exports/`](../exports/) under the same node id (app 1x, dashboards 0.5x). Sprint 1 states are included.

## Reading a spec
Each node: `n` name, `t` type, `x y w h` relative to the screen's top-left, `fill`/`stroke` (`c` hex, `a` opacity, `var` the design token), `sw` stroke width, `radius` (number or `[tl,tr,br,bl]`), `effects` (style name or list), `vars` (token bound to padding/gap/radius), `layout` (auto layout: `dir` row/col, `pad` `[top,right,bottom,left]`, `gap`, `main`/`cross` alignment), `size` (`fixed`/`hug`/`fill` per axis), `abs` (absolute inside auto layout), `clip`, `kids`.
Text: `text`, `style` (text style name), `font`, `size`, `lh` line height, `ls`, `color`, `align`; `runs` when one text mixes styles.
Instances: `component` + `variant` (e.g. `Button` / `variant=primary, state=disabled, size=L`): build it with the matching widget from `ds/`.
Icons: `icon` is a [Phosphor](https://phosphoricons.com) name (`ph/truck` → `truck`) with `color`; use `phosphor_flutter` / `@phosphor-icons/react`.
Images: `{ "image": "fill" }`; the photos are placeholders, any matching photo is fine.

## Rules for the build
- **Ignore the outer frame's radius 26 and stroke on app screens:** that is the phone mock-up on the canvas, not the UI.
- **Fonts:** build with `font.*.family` in `../tokens.json` (Readex Pro, El Messiri) while Figma shows Thmanyah. Keep size, weight and line height from the spec. Weight 900 builds as 700.
- Colors, spacing and radii come from tokens (`var` in the spec = the token name); `../tokens.json` matches the Figma variables exactly (checked 2026-11-18).
- RTL is the default. English mirrors the layout (see the two LTR examples).
- **LOC-DSH-1 (coverage zones map editor) has no screen in Figma.** It is built from the dashboard components (Page header, Form section, Data table, Map pin) until a design exists.

## Exporting more screens (later sprints)
Open the file in the Jazlah Figma Chrome profile with a debug port, then pass a list:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9223 --user-data-dir="$HOME/.chrome-jazlah-figma" "https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design"
node tools/design/figma_export.mjs docs/design/spec/sprint-2.txt --png
```
Node ids and tasks per screen are in [`../screens.md`](../screens.md).
