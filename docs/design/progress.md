# Design progress (Sprint 1, Figma)

Figma file: https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design
Order: #14, #16, #54, #42, #67, #201, #120, #148, then #204 (client presentation). Scope: the nine design tasks only.

## #14 DSN-DES-1 (branch `docs/14-brand-assets-information-architecture-design`, not yet PR'd)
Plan: batches 1, 2, 3a, 3b done; next 5 (IA, flows, LTR rules, Cover), then 4 (logo, alone, reviewed by the owner).

| Batch | Status | Script |
|---|---|---|
| 1 Foundations: pages, variables, text/effect styles, colors/type/spacing/elevation/contrast | done, reviewed | `01-DSN-DES-1-foundations.js` |
| 2 Core components: button, input, phone, OTP, chip, radio/checkbox/switch, stepper, tabs, bottom tab bar, toast, dialog, bottom sheet | done, 77 contrast checks, 0 failing | `02-DSN-DES-1-components-core.js` |
| 3a Mobile composites: app header (cart icon + counter), search bar, section header, badge, card, product card, store card, category tile, state panel (empty/no results/error/offline/denied), skeleton, map pin, status timeline | done, 84 contrast checks, 0 failing | `03-DSN-DES-1-components-mobile.js` |
| 3b Dashboard: nav item, side nav (admin/vendor/kitchen), top bar, page header, KPI card, data table (default/loading/empty/error), select, filters bar, form section, form actions | done, 47 checks, 0 failing | `04-DSN-DES-1-components-dashboard.js` |
| 5 IA + flows + `99 LTR Rules` + Cover index + `tokens.json` export | after 3 | not written |
| 4 Logo: «جزلة / Jazlah» lockups, ram-in-shield kept + one lightly adapted option, app icon, splash, favicon, export to `docs/design/brand/` | last, alone | not written |

Section node ids on `02 Components`: Buttons 1:713, Inputs 1:790, Selection 1:875, Navigation 1:956, Feedback 1:1045, Header & search 10:7, Badges 10:98, Cards 10:139, Empty & error 10:210, Map pin & timeline 10:269, Dashboard shell 14:514, Data table 14:675, Filters 14:964, Form layout 14:1046. Open one with `...?node-id=1-713` (colon becomes a dash).

## Owner decisions applied
- `tokens.json`: added `danger`, `danger-bg`, `warning`, `warning-bg`; `muted` -> #806865, `gold-text` -> #8E6129 (both AA on bg and paper); old values kept as `muted-soft` and `gold-deco` for large text/decoration. Errors use `danger`, never `ember`.
- Dark mode dropped. Figma Free plan allows one mode. Any "move to team" or "upgrade" prompt is declined.
- Spacing page bars run RTL (batch 1 script).

## Notes for the next session
- Run scripts with the loader in `design/figma/README.md` (sequential fetches, `_lib.js` + `_ds.js` + script). Before typing: snapshot, confirm the Scripter editor is the focused element, click New script (+). Touch only the Figma tab.
- Lessons: `Promise.all` fetches hang Scripter; `URL` and `loadAllPagesAsync` are unusable (the second takes over a minute); `resize()` resets auto-layout sizing; text properties override per-variant copy, so only expose texts identical across variants.
- Screenshots: no local server (the sandbox blocks binding a port), so exports are canvas screenshots. Clean PNG exports to `docs/design/components/` and `docs/design/flows/` are still to do; Figma's own export is the fallback.
- Assumptions to confirm: 4-digit OTP; stepper "+" on the right (RTL start); switch "on" = knob on the left; bottom bar has 4 tabs per the task (the approved prototype has a centre cart button), so the cart sits in the header; Latin digits in prices; icons are placeholders until an icon set is picked.
- Not reviewed visually yet: nothing in batch 2 left unreviewed; the "pressed" danger button uses 85% opacity (contrast 4.93).
- Pending from the owner: written client approval of the wordmark; decision between the two emblems.
