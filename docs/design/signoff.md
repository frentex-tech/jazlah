# Design sign-off (DRAFT: not approved)

Status: **draft prepared for the client review. Nothing below is approved.** The client's written approval is recorded in the "Approval" section by the owner, not by the design agent.

Figma file: [Jazlah — Product Design](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design). Open it on page [01 الحساب والدخول](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6633): the first page is the app screens. Every screen with its Figma link and the task that builds it: [screens.md](screens.md).

## How the file is organised
- Seven area pages in this order: 01 الحساب والدخول, 02 المتجر والطلب, 03 المواعيد والزيارة, 04 المناسبات والأضاحي, 05 الأعلاف والمحادثة, 06 البائع, 07 الإدارة. The `Design System` page comes last.
- On each page, right to left: the app (mobile) row, the web row, then that area's dashboard row. Only the main screens are in these rows; every state is in the `الحالات` section at the bottom of the page. Only the Arabic screen name is above each screen.
- Three pages at the end hold the clickable versions: `▶ تجربة التطبيق`, `▶ تجربة الويب`, `▶ تجربة لوحة التحكم`.
- Every screen has its states as separate screens (default, filled, loading, empty, error, disabled where they apply).

## What is being approved
- The launch design for the customer app, customer web, and the admin, vendor and kitchen dashboards: 670 screens, Arabic (RTL). English (LTR) is produced by mirroring and i18n (rules on the `Design System` page).
- The three clickable prototypes (app, web, dashboards): links in [screens.md](screens.md#prototype-flows).
- The brand: wordmark «جزلة / Jazlah» and one of the two emblem options.

## Decisions needed from the client
| # | Decision | Status |
|---|---|---|
| 1 | Written approval of the new wordmark (palette and fonts were approved earlier) | pending |
| 2 | Choice between emblem A and emblem B (see `docs/design/brand/`) | pending |

## Flows to walk through
Present ▶ links for the app, the web and the admin, vendor and kitchen dashboards are in [screens.md](screens.md#prototype-flows). The app prototype starts at the first onboarding slide and runs through sign-in to the home screen; the bottom bar, back buttons, cards and the order journey up to *order placed* and tracking are linked.

## Checks run on the file (2026-11-13)
- Every screen was looked at in Figma, page by page, after the last fixes (image, spacing, text, empty look, consistency with the rest).
- Lint over the 670 screens: no empty or "undefined" text, no leftover placeholders, no text outside its screen, no image placeholders.
- 1,215 prototype links on the three prototype pages, none broken, no enabled primary button without a link (script check, 2026-11-13). The app flow onboarding → sign-in → home → services tab was clicked through in Present.
- Order flow: the DSN-DES-1 acceptance "the regular order flow reaches *order placed* in ≤ 6 steps" is met on mobile and web.

## Known gaps (stated, not hidden)
- Prototype screens are copies, not instances: after a design change the prototype pages must be rebuilt by script.
- The scripts for the 2026-11-13 pass (layout, web header and footer, account side menu, split sign-in, image fixes, prototypes) were run live in the file and are not in `design/figma/scripts/` yet.
- Buttons with no specific target in a prototype go to the next screen of the journey. The device frame and scroll settings were left at Figma's defaults.
- Only part of the screens was looked at after this pass (pages 01, 02 and 07 main rows, the new screens, the sign-in screens); the state screens were changed by script and not reviewed one by one.
- New photos (goat, feed, grain, feed sacks, kitchen, chicken, fish, spices and others) are from Unsplash (free licence).
- Two app screens were added because the bottom bar needs them: `حسابي` (account hub) and `الخدمات` (services hub).
- Icons are Phosphor; photos come from the approved prototype's image set.
- The logo and emblem wait for the client's choice (decisions 1 and 2); the screens use the current wordmark.

## Feedback round
One batched round. Anything beyond the SRS goes to the change log, not into the design.
| Date | From | Screen or flow | Feedback | Decision | Done |
|---|---|---|---|---|---|
| | | | | | |

## Approval (to be filled by the owner)
| Item | Approved by | Date | How it was given (message, email, signed document) |
|---|---|---|---|
| Wordmark | | | |
| Emblem (A or B) | | | |
| Full design (screens.md + 10 flows) | | | |
