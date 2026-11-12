# Design sign-off (DRAFT: not approved)

Status: **draft prepared for the client review. Nothing below is approved.** The client's written approval is recorded in the "Approval" section by the owner, not by the design agent.

Figma file: [Jazlah — Product Design](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design). Open it on page [01 الحساب والدخول](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6633): the first page is the app screens. Every screen with its Figma link and the task that builds it: [screens.md](screens.md).

## How the file is organised
- Seven area pages in this order: 01 الحساب والدخول, 02 المتجر والطلب, 03 المواعيد والزيارة, 04 المناسبات والأضاحي, 05 الأعلاف والمحادثة, 06 البائع, 07 الإدارة. The `Design System` page comes last.
- On each page: the app (mobile) row, under it the web row (each web screen directly under its app twin), then that area's dashboard row. Fixed gaps, only the Arabic screen name above each screen.
- Every screen has its states as separate screens (default, filled, loading, empty, error, disabled where they apply).

## What is being approved
- The launch design for the customer app, customer web, and the admin, vendor and kitchen dashboards: 668 screens, Arabic (RTL). English (LTR) is produced by mirroring and i18n (rules on the `Design System` page).
- The 10 prototype flows (below).
- The brand: wordmark «جزلة / Jazlah» and one of the two emblem options.

## Decisions needed from the client
| # | Decision | Status |
|---|---|---|
| 1 | Written approval of the new wordmark (palette and fonts were approved earlier) | pending |
| 2 | Choice between emblem A and emblem B (see `docs/design/brand/`) | pending |

## Flows to walk through (Figma, Present ▶ from the flow's starting screen)
| # | Flow | Page | Screens in the prototype |
|---|---|---|---|
| 1 | Account: first launch | 01 | onboarding (3 slides) → phone → code → profile |
| 2 | Order, mobile | 02 | home → product → cart → checkout (pickup and day) → payment and review → order placed: **6 screens, 5 taps** |
| 3 | Order, web | 02 | the same six screens on web |
| 4 | Occasion | 04 | wizard (type, details, date) → quote → deposit payment |
| 5 | Farm visit | 03 | booking → confirmation |
| 6 | Cooking | 04 | dishes → cook it for me |
| 7 | Adha | 04 | landing → day → cuts |
| 8 | Feed and chat | 05 | feed → listing → chat |
| 9 | Vendor day | 06 | live board → slaughter time → freshness photo → label → earnings |
| 10 | Admin day | 07 | overview → orders → complaints → finance |

## Checks run on the file (2026-11-13)
- Every screen was looked at in Figma, page by page, after the last fixes (image, spacing, text, empty look, consistency with the rest).
- Lint over the 668 screens: no empty or "undefined" text, no leftover placeholders, no text outside its screen, no image placeholders.
- 35 prototype links, none broken; each flow has one starting point on the page of its first screen.
- Order flow: the DSN-DES-1 acceptance "the regular order flow reaches *order placed* in ≤ 6 steps" is met on mobile and web.

## Known gaps (stated, not hidden)
- Admin, vendor and kitchen screens are static (no click links) except the vendor and admin day flows.
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
