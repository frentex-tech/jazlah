# Design progress (Sprint 1, Figma)

Figma file: https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design
Order: #14, #16, #54, #42, #67, #201, #120, #148, then #204 (client presentation). Scope: the nine design tasks only.

## #14 DSN-DES-1 (branch `docs/14-brand-assets-information-architecture-design`, not yet PR'd)
Plan: batches 1, 2, 3a, 3b and 5 (a IA + flows, b LTR rules, c Cover) done; only batch 4 (logo, alone, reviewed by the owner) remains, then the PR.

| Batch | Status | Script |
|---|---|---|
| 1 Foundations: pages, variables, text/effect styles, colors/type/spacing/elevation/contrast | done, reviewed | `01-DSN-DES-1-foundations.js` |
| 2 Core components: button, input, phone, OTP, chip, radio/checkbox/switch, stepper, tabs, bottom tab bar, toast, dialog, bottom sheet | done, 77 contrast checks, 0 failing | `02-DSN-DES-1-components-core.js` |
| 3a Mobile composites: app header (cart icon + counter), search bar, section header, badge, card, product card, store card, category tile, state panel (empty/no results/error/offline/denied), skeleton, map pin, status timeline | done, 84 contrast checks, 0 failing | `03-DSN-DES-1-components-mobile.js` |
| 3b Dashboard: nav item, side nav (admin/vendor/kitchen), top bar, page header, KPI card, data table (default/loading/empty/error), select, filters bar, form section, form actions | done, 47 checks, 0 failing | `04-DSN-DES-1-components-dashboard.js` |
| 5a IA maps (app, dashboards) + 6 key flows on `90 Flows` | done, 46 checks, 0 failing | `05-DSN-DES-1-ia-flows.js` |
| 5b `99 LTR Rules`: Home, Product, Checkout, Admin table, AR next to mirrored EN | done, 0 unmapped copy | `06-DSN-DES-1-ltr-rules.js` |
| 5c `00 Cover`: hero + clickable index of every page and section | done | `07-DSN-DES-1-cover.js` |
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

## Session 3 (batches 3a, 3b, 5)
- Owner replies applied: OTP 4 digits, stepper "+" at the start edge, switch on = knob left, Latin digits, 4-tab bottom bar with the cart as a header icon plus counter, Phosphor icons (regular, fill when active) replacing every placeholder, `danger-pressed` token (#8E1F19, paper text 8.64) replacing the 85% opacity.
- Found while reviewing: vertical stacks hugged the left edge in RTL (vendor row, badges). `frame()` now defaults vertical stacks to right-aligned unless `ltr` is set; all component batches were rerun.
- Toast is now light (paper + icon in the status color): icon contrast on the dark fill was under 3:1.
- Script lessons added: `Promise.all` fetches hang; `URL`/`loadAllPagesAsync` unusable; `new AF(...)` per script lets one loader run several scripts in order (each in its own scope); wait for output text that is NOT in the typed loader (the editor value matches `wait_for` text).
- Hangs: none re-run more than once. Failures were script bugs (FILL before append, missing default, wrong style name), each fixed and rerun once.
- Contrast: 02: 81, 3a: 84, 3b: 47, 5a: 46, 5b: 20 checks, 0 failing. 5c (cover) printed no report that was read.
- Exports: `exportAsync` works (PNG 2x), but the Scripter output lives in a cross-origin iframe the snapshot cannot read and the sandbox blocks a local receiver, so nothing could be saved to `docs/design/components` or `flows`. Export from Figma by hand, or allow `sandbox.network.allowLocalBinding` and a receiver script.
- Chrome: the Figma tab had been closed, so a new tab was opened for the file; no other tab was touched.
- Next: batch 4 (logo) alone, then PR. Open items: written client approval of the wordmark, ram-in-shield vs adapted emblem (owner), dark mode needs a paid plan, icons are Phosphor loaded from GitHub at run time (SVGs are embedded in the file after the run).

## Session 4 (#14 PR, #16 ACC, #54 STF, #67 SCH)
- #14: PR #205 opened on develop (Closes #14), card In Review. Logo batch 4 done (options A shield, B roundel; Figma section 21:2; SVGs in `docs/design/brand/`). Pending the client: wordmark approval and the A/B choice.
- Owner decisions: stepper mirrors in LTR (note updated); PNG exports cancelled for good (Figma and its links are the reference); dark mode deferred.
- Speed-ups: `_ds.js` now has mobileScreen/webScreen/dashScreen templates, stateCopy, screenSection (screens placed directly in the Section so flow starts work), slot(), retext(), tap/flowStart. `design/figma/COMPONENTS.md` documents the component API so subagents can write scripts without Figma access. Three subagents wrote the ACC, STF and SCH scripts in parallel (files 12-19); only the lead ran them in Figma.
- Branches: #16 `docs/16-screens-onboarding-otp-profile-addresses` (also holds the STF and SCH scripts: they were written and run before their own branches existed), #54 and #67 branches not started, because `task.py start` for them is still to be run and their scripts live on the #16 branch for now.
- Ran in Figma: 10 (auth), 12/12b (settings, addresses, map, permission, coverage), 13/13b/13c (web + admin login), 14-17 (STF), 18-19 (SCH), 20 (order flow link: home → product → checkout step 1; cart, payment and tracking are later tasks). Contrast: every run 0 failing.
- Known defects to fix on the next run: STF product "Error" state button said "undefined" (fixed in the script, rerun 15 to apply); not reviewed visually yet: web STF/SCH/ACC sections, search sheet, SCH checkout and admin ops pages (only contrast reports and section/screens counts were checked); `Product/Detail` uses Caption (12) for some helper text, Arabic body should be >= 14.
- Prototype: ACC first-launch flow wired (5 links, flow start on page 10). Regular order: 2 links + flow start on page 10 + a hyperlink on `90 Flows` (a flow start must live on the page of its frame).
- Next session: (1) run `task.py start 54` and `start 67`, move their scripts to those branches (git mv per task, or cherry-pick), (2) review the unreviewed sections by screenshot, rerun 15, (3) READMEs per epic in `docs/design/<epic>/`, (4) open PRs for #16, #54, #67 (Closes), then #42 (OPX is next in the owner's order after #67: #201 #120 #148 #204 follow).
