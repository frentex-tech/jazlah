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

## Session 5 (quality pass; PRs for #16, #54, #67 NOT opened yet)
- Cleanup done: `task.py start 54` and `67`; STF scripts (14-17, 20) live on `docs/54-…`, SCH scripts (18, 19) on `docs/67-…`, ACC (10-13c) on `docs/16-…`. Shared files (`_ds.js`, `_lib.js`, COMPONENTS.md, README) are on each branch.
- Fixes applied in Figma and scripts: "undefined" button in STF state panels (cta optional); empty-value error fields now show the placeholder; multi-word Arabic Caption (12) text promoted to Body/M (14) in screens and component hints; empty text nodes removed; Section canvases were rendering black (variable-bound paint on Sections), now the cream hex. Patch scripts: `31-fix-component-captions.js` (on the #14 branch, rerunnable), lint: `30-lint-screens.js`.
- Lint over 141 screens now: undefined/empty none, placeholders none, text outside frame none, unbound fills none, state suffix none. Remaining small-Arabic hits are 3-word size-S badge labels ("غير متاح حاليًا", 12), accepted as short labels.
- NOT done (be honest): the screen-by-screen close-up visual review of every section in #16, #54, #67 (only Home, Product, Settings, Address map, Onboarding, Logo and the component sections were looked at); Present-mode click-through of the prototypes; per-epic READMEs (`docs/design/<epic>/README.md`); PRs for #16, #54, #67; tasks #42, #201, #120, #148, #204 not started.
- Next session, in this order: (1) rebase the #14 patch scripts onto the other branches if needed, (2) close-up review of each section (use node ids from the Figma file: ACC sections 24:78 … 45:2864, STF 63:1749 … 63:3831, SCH `sec-sch-*`), (3) Present test of the ACC and order flows, (4) READMEs + PRs #16/#54/#67, (5) #42 with subagents.

## Session 6 (polish round, code ready, NOT yet run in Figma)
- Owner review of page 10 turned into: real photos, no internal notes in screens, filled phone values, header/cart badge, brand hero on auth screens, product page order + price-breakdown sheet, sections as a grid with Readex titles, Home as the prototype start, same review for web and admin ops.
- Written and pushed (not run): `_ds.js` (photoPaint/setPhoto/emblemNode/phoneValue/authScreen, section annotations S.note, Readex section titles), 10/13/13c (auth hero, onboarding logo + photo, phone "55 123 4567"), 14/15 (stories slot removed from the screen and moved to a section annotation, product page reordered, breakdown sheet opened from the sticky total), `32-photos.js` (placeholder -> real photo pass), `33-polish.js` (cart badge, section fit + grid rows, Home first in flow starts).
- Run order in Figma: #16 scripts 10, 13, 13c, 11; #54 scripts 14, 15, 20; then 32, then 33. Commits: #16 825509f, #54 f7abeff, #67 67be6ef.
- Blocked: the Chrome tab with Figma edit access was not available (open tabs were view-only or denied), so nothing was executed.

## Session 7
- PRs open: #205 (#14), #206 (#16), #207 (#54), #208 (#67). Not merged. Cards in In Review.
- Store-logo layer-order bug fixed in 32-photos; re-run done.
- Added: `34-audit-images.js` (lists remaining image placeholders per page), static map image `docs/design/reference/prototype/img/map.jpg`, 32-photos now covers pages 31/32, map frames and photo-named frames; `30-lint-screens` fails when an image placeholder remains.
- Scripts for #42 (40-42), #148 (50-53), #120 (60-63), #201 (70-77) written by subagents; not yet run in Figma.
- BLOCKER: the chrome-devtools MCP server was disconnected, so nothing could be run in Figma. Next: reconnect, run 34 audit → 32-photos until 0 → lint, then run task scripts in order #42, #148, #120, #201 (start each with `task.py start N`, PR with "Closes #N").
- Scripts committed to per-task branches (written, never run in Figma): docs/42-… (40-44), docs/148-… (50-53), docs/120-… (60-63), docs/201-… (70-77). Cards for #42, #148, #120, #201 are In Progress. No PRs yet for these four.
- Known gaps flagged by the script authors: side-nav active item is fixed, filters-bar labels fixed, no prototype links for OPX admin, tables/charts hand-built, component default texts assumed (retext may only warn).

## Session 8 (images to zero, then #42)
- Ran 34 audit (168) -> 32-photos (twice; the second pass catches maps) -> audit again. Remaining hits were audit false positives: `ph/storefront` is a Phosphor glyph (14-20px in vendor rows and nav items) and "Map pin" matched the map rule. 34 and 30 now judge `ph/storefront` by its own size (>= 32px) and skip pins. Result: 0 image placeholders on all pages, `LINT OK images`.
- Lint over 142 screens: undefined/empty none, placeholder none, outside none, no-state-suffix none. Still listed and accepted: 6+ small-Arabic 3-word badge labels (12px), unbound fills on the emblem Vector inside onboarding/login.
- Audit/lint fix cherry-picked to all eight design branches (14, 16, 54, 67, 42, 148, 120, 201).
- Cleanup: the first (crashed) runs of 40/44, 60-63 and 74/77 left 319 half-built frames at page level outside any Section (99 on page 10, 131 on 20, 49 on 30, 40 on 31). Moved to `🗄 Archive` (`37-archive-orphans.js`; screens are never deleted). Reviewed by screenshot: 13 of the 82 new sections (FED app, OCC wizard/Adha, OPX order detail, VND apply, admin overview, vendor board); the rest relied on lint, contrast and the same templates.

## #42 VND-DES-1 (run in Figma, PR opened)
- First-run fixes: `tokens.json` was stale on the #42/#148/#120/#201 branches (synced); `info-bg` / `success-bg` colors do not exist (notices use `sand`, in 40-44); new `35-nav-active.js` sets the side-nav active item per screen (74 screens, no unmatched paths; the component bakes a fixed active item).
- Result: 194 screens, lint clean, 0 image placeholders, 0 failing contrast checks (40: 77, 41: 22, 42: 27, 43: 22, 44: 31). Vendor page: 23 frames, no overlaps. Not done: Present-mode click-through, per-screen close-ups.
- Next: #148 (50-53), #120 (60-63), #201 (70-77). Branches need `35-nav-active.js` (cherry-pick from the #42 branch).

## #148 FED-DES-1 (run in Figma, PR opened)
- Scripts 50-53 ran first time (contrast failing 0: 11, 13, 14, 20). Lint found text outside frame: filter and unit chip rows did not wrap (342/358 px) -> `layoutWrap` in 50 and 51. `35-nav-active.js` got Admin/Feed paths (92 screens matched, 0 unmatched).
- Lint: 285 screens, undefined/placeholder/outside none, image placeholders 0.

## #120 OCC-DES-1 (run in Figma, PR opened)
- First run: the 60-63 scripts failed on `kind + "-bg"` pills (no `success-bg`/`info-bg` tokens). Fixed to `sand` surface with `ink` text (success on sand was 3.93, failing). Final contrast checks 188 / 192 / 184 / 83, failing 0. `35-nav-active.js` got Occasions/Kitchens/Adha/Board paths (121 screens matched; Vendor/Visits/Calendar and Vendor/Animals/Register have no nav item).
- Lint: 405 screens, undefined/placeholder/outside none, `LINT OK images`.
- Figma showed "Connection issue affecting saving" once during this run; it cleared afterwards. If anything is missing in the file, rerun the task scripts (idempotent).

## #201 OPX-DES-1 (run in Figma, PR opened)
- Scripts 70-77 ran. Fixes: contrast self-checks for success/info text now use `paper` (3.93 on sand failed); `"ck" in v` guard for string table cells in 74-77; `Cancel/Done` header title set (default "عنوان الصفحة" was left, caught by lint). Contrast checks failing 0 on all eight.
- Lint over the whole file: 580 screens, undefined/placeholder/outside none, `LINT OK images`. `35-nav-active.js`: 224 dashboard screens set, Admin/Staff has no matching nav item.
- New `36-export-index.js` prints sections, frames and flows (read from the Scripter DOM with evaluate_script on the editor element). Index: 117 sections, 649 frames, 2 flow starting points so far (ACC first launch, regular order).
