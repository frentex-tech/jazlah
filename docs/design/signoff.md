# Design sign-off (DRAFT: not approved)

Status: **draft prepared for the client review. Nothing below is approved.** The client's written approval is recorded in the "Approval" section by the owner, not by the design agent.

Figma file: [Jazlah — Product Design](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design). Open it on page [01 التطبيق](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6633): the first page is the app screens. Every screen with its Figma link and the task that builds it: [screens.md](screens.md).

## How the file is organised
- Two design pages: `01 التطبيق` (app) and `02 لوحات التحكم` (admin, vendor and kitchen dashboards). The `Design System` page follows. The customer web design was removed on 2026-11-13 at the owner's request; see [archive/web-screens-2026-11-13.md](archive/web-screens-2026-11-13.md).
- Inside a page the main screens are grouped by product area (dashboards: by role), right to left in journey order; every state is in the `الحالات` section at the bottom of the page. Only the Arabic screen name is above each screen.
- Three pages at the end hold the clickable versions: `▶ تجربة التطبيق`, `▶ تجربة الويب`, `▶ تجربة لوحة التحكم`.
- Every screen has its states as separate screens (default, filled, loading, empty, error, disabled where they apply).

## What is being approved
- The launch design for the customer app and the admin, vendor and kitchen dashboards: 587 screens, Arabic (RTL). English (LTR) is produced by mirroring and i18n (rules on the `Design System` page).
- The two clickable prototypes (app, dashboards): links in [screens.md](screens.md#prototype-flows).
- The brand: wordmark «جزلة / Jazlah» and the gold profile mark (the ram head in side view, `docs/design/reference/prototype/img/mark-gold.png`).

## Decisions needed from the client
| # | Decision | Status |
|---|---|---|
| 1 | Written approval of the new wordmark (palette and fonts were approved earlier) | pending |
| 2 | Emblem: the project owner chose the gold profile mark on 2026-11-13 (neither option A nor B). It is applied across the file. The client's written approval is still to be recorded below | chosen by the owner, client approval pending |

## Flows to walk through
Send the client one link: the start page `▶ ابدأ من هنا` (link in [screens.md](screens.md#prototype-flows)). It was opened in Present on 2026-11-13 and the cards were clicked (app, admin, vendor, kitchen; the website card was removed with the web design) and each opened its prototype in a new tab. The file opens without a Figma account (checked from a signed-out browser).

Present ▶ links for the app, the web and the admin, vendor and kitchen dashboards are in [screens.md](screens.md#prototype-flows). The app prototype starts at the first onboarding slide and runs through sign-in to the home screen; the bottom bar, back buttons, cards and the order journey up to *order placed* and tracking are linked.

## Client round 2 (2026-11-13)
What changed after the client saw the design:
- **Typeface:** all text is now the Thmanyah typeface (Thmanyah Sans for the interface, Thmanyah Serif Display for large headings), replacing Readex Pro and El Messiri. The font has no SemiBold, so those texts are Bold. The font is installed on the designer's machine only: it is not a Figma cloud font, and its licence forbids redistributing the files, so they are not in the repo. Read the licence that ships with the download before bundling the font in the app.
- **Home screen:** rebuilt in a trust-first order: points balance and delivery/pickup switch, customer stories, loyalty banner, then categories as large image tiles (the feed category included) and best sellers.
- **New app features**, taken from the earlier prototype: receipt stories with sharing (4 screens), loyalty points (4), Sahm Al-Khair charity shares (5), each list screen with loading, empty and error states. Entry points were added to the home, account, services, cart and order-placed screens.
- **New admin screens** for those features: story review, points and rewards settings, Sahm batches, batch proof upload. The admin side menu has three new items.
- **Order tracking** is a timeline with times, freshness photos and the courier card; the map was removed.
- **RTL fixes:** radio, checkbox and switch rows now line up on the right. A language switch was added to onboarding and sign-in, and two English (LTR) example screens show the mirroring.
- **Scope note:** stories, loyalty and Sahm are post-launch in the delivery plan (PLD-DES-1). They were designed now at the client's request; the sprint plan was not changed.

## Checks run on the file (2026-11-13)
- Script lint over all 587 screens after the last changes: no empty or "undefined" text, no text outside its screen, no missing icon.
- Clipped layouts: a script found 110 auto-layout frames on web and dashboard screens whose content was cut off (among them the whole animal-registration form) and opened them up. 28 small ones remain (tab labels 7 to 9 px taller than their tab, and the Adha settings body).
- Looked at in Figma: every main screen on the design pages, and the state screens of pages 01 and 02 (app). The other state screens were covered by the lint only.
- Prototype: 928 links, none broken (script, after the round-2 rebuild). What was clicked through in Present is listed in [screens.md](screens.md#prototype-flows).
- Coverage against the Output of ACC-DES-1, VND-DES-1, STF-DES-1, SCH-DES-1, OPX-DES-1, OCC-DES-1 and FED-DES-1: every listed screen exists in the file. PLD-DES-1 (post-launch) is not designed.

## Known gaps (stated, not hidden)
- Round 2 was applied directly in the file; it has no script in `design/figma/scripts/`. The layout script now in use differs from `92` (two pages, areas 7 and 8 added).
- After round 2 the lint was re-run over all 587 screens (clean except six filter bars, fixed). Screens looked at: the new and changed ones, and the main app rows. The dashboards and state screens were not looked at again one by one after the font change.
- Scrims behind sheets had become opaque on 39 screens during round 1 and were restored to 55% in round 2.
- The new features have no build tasks, API contracts or SRS requirement IDs yet.
- No customer web design in the file since 2026-11-13 (removed at the owner's request). The web build tasks (`*-WEB-*`) have no screens to build from until the scope is confirmed with the client, and the public vendor-application pages went with it.
- No PNG exports of the key screens in `docs/design/<epic>/` (the DES tasks ask for them): they need a Figma export or API token, which the design session did not have.
- The kitchen role is one screen, the kitchen board, which is what KIT-DSH-1 asks for; its side menu now shows that one item only. The admin `مهام الطبخ` (cooking jobs: by day and status, manual assign, meat-sent action) was added on 2026-11-13 with loading, empty, error and permission-denied states; it is reached from a link row on the `المطابخ` screen, because the admin side menu has no item for it.
- Prototype screens are copies, not instances. The device frame was left at Figma's default; long app screens scroll inside their body.
- Scripts `90` and `91` were recovered from the live session and not re-run from the repo. Later one-off passes of the same day (account side menu, split sign-in, image remapping, store monograms, the two new app screens, the 390 web set, the clipped-layout fix, the explicit prototype button map) were applied directly in the file and have no script.
- Some fills added on 2026-11-13 use raw colours instead of variables (gradient overlays on photos, the store monogram green, canvas titles).
- Dashboards are 900 px or taller.
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
