# Design sign-off (DRAFT: not approved)

Status: **draft prepared for the client review. Nothing below is approved.** The client's written approval is recorded in the "Approval" section by the owner, not by the design agent.

Figma file: [Jazlah — Product Design](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design). Open it on page [01 الحساب والدخول](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6633): the first page is the app screens. Every screen with its Figma link and the task that builds it: [screens.md](screens.md).

## How the file is organised
- Seven area pages in this order: 01 الحساب والدخول, 02 المتجر والطلب, 03 المواعيد والزيارة, 04 المناسبات والأضاحي, 05 الأعلاف والمحادثة, 06 البائع, 07 الإدارة. The `Design System` page comes last.
- On each page, right to left: the app (mobile) row, the web row, then that area's dashboard row. Only the main screens are in these rows; every state is in the `الحالات` section at the bottom of the page. Only the Arabic screen name is above each screen.
- Three pages at the end hold the clickable versions: `▶ تجربة التطبيق`, `▶ تجربة الويب`, `▶ تجربة لوحة التحكم`.
- Every screen has its states as separate screens (default, filled, loading, empty, error, disabled where they apply).

## What is being approved
- The launch design for the customer app, customer web, and the admin, vendor and kitchen dashboards: 676 screens, Arabic (RTL). English (LTR) is produced by mirroring and i18n (rules on the `Design System` page).
- The three clickable prototypes (app, web, dashboards): links in [screens.md](screens.md#prototype-flows).
- The brand: wordmark «جزلة / Jazlah» and the gold profile mark (the ram head in side view, `docs/design/reference/prototype/img/mark-gold.png`).

## Decisions needed from the client
| # | Decision | Status |
|---|---|---|
| 1 | Written approval of the new wordmark (palette and fonts were approved earlier) | pending |
| 2 | Emblem: the project owner chose the gold profile mark on 2026-11-13 (neither option A nor B). It is applied across the file. The client's written approval is still to be recorded below | chosen by the owner, client approval pending |

## Flows to walk through
Present ▶ links for the app, the web and the admin, vendor and kitchen dashboards are in [screens.md](screens.md#prototype-flows). The app prototype starts at the first onboarding slide and runs through sign-in to the home screen; the bottom bar, back buttons, cards and the order journey up to *order placed* and tracking are linked.

## Checks run on the file (2026-11-13)
- Script lint over all 676 screens after the last changes: no empty or "undefined" text, no text outside its screen, no missing icon.
- Clipped layouts: a script found 110 auto-layout frames on web and dashboard screens whose content was cut off (among them the whole animal-registration form) and opened them up. 28 small ones remain (tab labels 7 to 9 px taller than their tab, and the Adha settings body).
- Looked at in Figma: every main screen on pages 01 to 07, and the state screens of pages 01 and 02 (app). The other state screens were covered by the lint only.
- Prototype: 1,282 links, none broken, no enabled primary button without a link (script). What was clicked through in Present is listed in [screens.md](screens.md#prototype-flows).
- Coverage against the Output of ACC-DES-1, VND-DES-1, STF-DES-1, SCH-DES-1, OPX-DES-1, OCC-DES-1 and FED-DES-1: every listed screen exists in the file. PLD-DES-1 (post-launch) is not designed.

## Known gaps (stated, not hidden)
- No PNG exports of the key screens in `docs/design/<epic>/` (the DES tasks ask for them): they need a Figma export or API token, which the design session did not have.
- Web at 390 covers six key screens only (home, store, product, cart, payment review, order placed), built from the app screens with the `Web header (390)` and `Web footer (390)` components. The other web screens exist at 1440 only.
- The kitchen role has one screen (the kitchen board, as OCC-DES-1 lists); its side menu shows three more items that have no screen.
- Prototype screens are copies, not instances. The device frame was left at Figma's default; long app screens scroll inside their body.
- Scripts `90` and `91` were recovered from the live session and not re-run from the repo. Later one-off passes of the same day (account side menu, split sign-in, image remapping, store monograms, the two new app screens, the 390 web set, the clipped-layout fix, the explicit prototype button map) were applied directly in the file and have no script.
- Some fills added on 2026-11-13 use raw colours instead of variables (gradient overlays on photos, the store monogram green, canvas titles).
- Web page heights follow their content (about 1,000 to 1,900 px); dashboards are 900 px or taller.
- New photos are from Unsplash (free licence). Store logos are letter monograms, not real logos.
- The `deploy` check of the progress dashboard fails on pull requests: the `github-pages` environment only accepts `develop`.
- The emblem in the file is a PNG, not a vector: on light backgrounds (web header, onboarding) it is darkened with an image filter. A vector redraw in two colours (gold for dark, gold-text for light) is still needed, and `docs/design/brand/` still holds only options A and B.
- The wordmark waits for the client's written approval (decision 1).

## Feedback round
One batched round. Anything beyond the SRS goes to the change log, not into the design.
| Date | From | Screen or flow | Feedback | Decision | Done |
|---|---|---|---|---|---|
| | | | | | |

## Approval (to be filled by the owner)
| Item | Approved by | Date | How it was given (message, email, signed document) |
|---|---|---|---|
| Wordmark | | | |
| Emblem (gold profile mark) | | | |
| Full design (screens.md + 10 flows) | | | |
