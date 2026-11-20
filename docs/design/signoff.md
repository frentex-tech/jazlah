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
- **Typeface:** all text is now the Thmanyah typeface (Thmanyah Sans for the interface, Thmanyah Serif Display for large headings), replacing Readex Pro and El Messiri. The font has no SemiBold, so those texts are Bold. The font is installed on the designer's machine only: it is not a Figma cloud font, and its licence forbids redistributing the files, so they are not in the repo. Read the licence that ships with the download before bundling the font in the app. **Build decision 2026-11-18:** the app and dashboard are built with Readex Pro and El Messiri until the licence is checked; see `tokens.json`.
- **Home screen:** rebuilt in a trust-first order: points balance and delivery/pickup switch, customer stories, loyalty banner, then categories as large image tiles (the feed category included) and best sellers.
- **New app features**, taken from the earlier prototype: receipt stories with sharing (4 screens), loyalty points (4), Sahm Al-Khair charity shares (5), each list screen with loading, empty and error states. Entry points were added to the home, account, services, cart and order-placed screens.
- **New admin screens** for those features: story review, points and rewards settings, Sahm batches, batch proof upload. The admin side menu has three new items.
- **Order tracking** is a timeline with times, freshness photos and the courier card; the map was removed.
- **RTL fixes:** radio, checkbox and switch rows now line up on the right. A language switch was added to onboarding and sign-in, and two English (LTR) example screens show the mirroring.
- **Scope note:** stories, loyalty and Sahm are post-launch in the delivery plan (PLD-DES-1). They were designed now at the client's request; the sprint plan was not changed.

## Client logo (2026-11-13)
The client sent the final logo (gold horns above «جزلة», «JAZLA» below). It replaced the earlier mark in all 365 placements, including the prototype pages, with no change to prototype links (script check: 0 broken). Looked at after the change: app sign-in, code entry, onboarding, admin and vendor sign-in, a vendor dashboard screen with the side menu, the start page, and the Design System logo section. Not clicked through again in Present. The logo is a cut-out from a screenshot; a vector file from the client is still needed. See [brand/README.md](brand/README.md).

## Gap-closing pass (2026-11-18)
Done at the owner's request, directly in the file (no script), after a named version «قبل استكمال النواقص 2026-11-18»; the version after is «بعد استكمال النواقص 2026-11-18».
- **Vendor application is back, without a customer website.** One public page for the domain (download the app, join as a vendor), then the application inside the dashboard app as the delivery plan has it (VND-DSH-1): phone and code, five steps (business details, documents, bank account, location, photos and review), and a status page (in review, approved, rejected with the note and re-apply). The sign-in line on the vendor sign-in screen now points to the application instead of «موقع جزلة».
- **How the applicant hears back (owner's decision, 2026-11-18):** the details go by email (received, approved with the dashboard link, rejected with the note); SMS stays for the sign-in code, plus one short SMS on approval. The three emails and the SMS are drawn as screens. **The API has none of this yet:** there is no mail integration (`services/api/src/integrations/` has `sms` and `storage` only), the application takes no email, and approving or rejecting sends nothing. The form also asks for the business type and the bank name, which the delivery plan lists (VND-API-1) and the current application input does not take.
- **Kitchen:** sign-in screens (phone, code) with error and loading states; a task-details panel on the board (servings, due time, meat arrival, customer notes, the received → cooking → ready action); a «المنتهية» tab listing finished jobs. The panel and the tab go beyond the Output of KIT-DSH-1. In the build the dashboard has one `/login` that routes by role (APP-DSH-1); the admin, vendor and kitchen sign-in screens are that one route with a different side panel.
- **Vendor sign-in** now has its error and loading states.
- **Admin side menu** has a «مهام الطبخ» item (in the `Side nav` component, so on every admin screen). Its icon is the products icon reused.
- **Prototype:** the start page has five cards (the fifth opens the public page). The kitchen flow starts at its sign-in. 939 links between screens, none broken (script). Clicked in Present: public page → join → phone → code → step 1. Not clicked: the other steps, the kitchen flow, the new admin menu item.
- **PNG exports** of the 151 main screens are in [exports/](exports/README.md).
- The file now holds 619 screens: `01 التطبيق` 310 (unchanged), `02 لوحات التحكم` 309 (73 main, 236 states).
- Still open: the logo vector (needs the client's file), the client's written approval, 390-wide versions of application steps 2 to 5, build tasks for the public page and for the emails.

## Agreed build differences, dashboard (2026-11-19)
Agreed by the owner in the Sprint 1 fix round, after the design QA (`reviews/qa-design-dashboard-1.md`). Everything else on the dashboard follows Figma. Decided earlier and not repeated here: Readex Pro / El Messiri instead of Thmanyah, six code cells instead of four, OSM map tiles for development.

| Screen (node) | Figma | Build | Why |
|---|---|---|---|
| Admin sign-in, phone error (118:5954) | «هذا الرقم غير مسجّل كموظف» | «رقم الجوال غير مكتمل», as on vendor (410:38667) and kitchen (410:38896) | The API sends a code to any number and only fails at the code step, so nobody can test which numbers are staff. The phone step cannot know it. |
| Code error, all panels (118:6942, 410:38780, 410:39009) | «الرمز غير صحيح، حاول مرة أخرى» | «الرمز غير صحيح أو الرقم غير مصرّح له، حاول مرة أخرى», in the same single line; the card keeps the Figma height | The API answers a wrong code and a number without dashboard access the same way, and the task asks for a clear "no access" message. |
| Panel picker, `/login/choose` | No frame | The sign-in card with one DS «Card» (16:749) per panel: name and a one-line description | A user with several panels needs to choose one; built only from DS parts and tokens. |
| Page bodies not built yet: admin overview, vendor board, kitchen board (135:46622, 135:39184, 131:79506) | Their content | The empty frame (135:46966) without its «ابدأ أول طلب» button | The bodies are later tasks; a button with nowhere to go would mislead. |
| Loading and error while a page loads (135:46807, 135:47170) | Under the page's own header | The same body, without the page header | One loading and one error screen serve every page, and they cannot know its title. |
| Not-found, inside a panel and outside | No frame | The empty-state card (135:46966) with «الصفحة غير موجودة» and a way home | Unbuilt menu items and mistyped addresses must stay in Arabic and, in a panel, inside the shell. |
| Select, open (16:1584) | `caret-up` icon | `caret-down` stays (the browser's own list opens) | A native select keeps keyboard, screen-reader and RTL behaviour for free; a custom list box is not worth it before a screen needs it. |
| Panel picker card, hover | Card has no hover state | Hover and keyboard focus show the Card's selected state (ember border) | A link needs a visible focus; the selected state is the DS's own. |
| Top bar, every shell (16:1239) | Staff name «عبدالرحمن», avatar with its initial «ع» | The masked phone, avatar with a user icon | The API has no staff name yet (not-built-yet.md, "Requested by the apps"). Switch to the name and initial when it does. |

## Build differences, Sprint 2 dashboard: VND-DSH-1 vendor application and store profile (pending owner sign-off, not agreed)
| Frame | Difference | Why |
|---|---|---|
| 410:39654, 410:40011, 410:40094 | Email, district, address details, logo and cover are shown disabled; the business type is chosen but not sent | Not in the application API (not-built-yet.md) |
| 410:39654 | The phone field shows the masked number of the sign-in answer (`+966 5•• ••• 567`) | The dashboard never holds the full number |
| 410:39774 | The banner counts the fields to fix (one, two or more) instead of «the two fields»; email cannot be in error (disabled) | Generic for any field; email is an API gap |
| 410:39936 | The bank field is read-only, filled from the IBAN bank code, instead of a list | The API takes no bank; the code in the IBAN names it |
| 410:40011 | A real map (OSM tiles) instead of the illustration; the pin is set by dragging, clicking or Enter | Needed for real coordinates |
| 410:40094 | Summary has no email row; the location row shows the city | API gaps |
| 410:40216, 410:40644 | Pending text without the email; application number is `VA-` + the first 8 characters of its id | No email or short number in the API |
| 410:40259 | No commission row | Not in the application answer |
| All status frames | «Contact vendor support» is plain text | No support contact defined |
| 131:24074 | A second description field (English) and a VAT number field are added; tagline, address and working hours are disabled; hours switches are off | The API has AR/EN descriptions and VAT; the rest are API gaps |
| 131:24074 | Description hint says up to 1000 characters (Figma 200) | Mirrors the API limit |
| 131:24427 | The store name is read-only, so only the contact errors of the frame occur | Only an admin changes the name |
| 131:24863 | Reached when a save or upload answers VENDOR_SUSPENDED: the fields keep their values but use the disabled style. A suspended vendor opening the page is signed out with the reason (API rule) | The API refuses every vendor call when suspended |
| 131:24717 | Uses the shared error panel copy for the body | Same as the frame text |
| 410:39654 and the other steps | The public bar shows «sign out» (customer session only, and the drafts on the device) instead of «already a vendor? sign in» | The applicant is signed in on these steps; signing out must be possible (review of #275) |
| 410:39936, restore | A restored draft asks for the IBAN again | The IBAN is never kept on the device |
| 131:24074 | No «preview the public store page» link (asked by the sprint task, not in the frame) | No public store page URL: no customer website, the store is seen in the app |

## Build differences, Sprint 2 dashboard: VND-DSH-2 admin vendor list and review (pending owner sign-off, not agreed)
| Frame | Difference | Why |
|---|---|---|
| 131:16744 | «Pending review» lists applications (no commission: «not set»); «active» and «suspended» list vendors, whose date is their approval date. The «awaiting documents» badge of the frame does not occur | The API has applications (pending/approved/rejected) and vendors (active/suspended), and no «awaiting documents» status |
| 131:16744 | Products column shows a dash; category and date filters, «invite vendor» and «export» are disabled | API gaps (not-built-yet.md) |
| 131:16744, 131:18192 | The status filter and the tabs are one choice: picking a status selects its tab and shows the chip; the default tab («active») shows no chip | One status at a time in the API |
| 131:16744 | Search box keeps the shared Filters bar width (200) instead of filling the row | Shared DS component |
| 131:17362 | Without any filter, an empty tab says «no stores here yet» without the clear button | The frame's copy is for filtered results |
| 131:18512 | Store details have no «activity» row; «responsible» shows the account holder; the phone row shows only for a vendor with a contact phone; the IBAN is masked | Not in the application answer; the full IBAN is never sent |
| 131:18512 | A real map (OSM tiles) with the city under it, instead of the illustration and street address | Real coordinates; no address in the API |
| 131:18512 | Viewer bar shows the document kind without «page 1 of 2»; a PDF shows «open the file» instead of a preview | The links carry no content type or pages; the CSP allows no embedded objects |
| 131:18512 | «Ask for a new upload» is disabled; «document matches» and the review checklist are marks on the page only, and approving does not require them | No API for either |
| 131:18512 | Facility photos (a document kind) fill «store photos» in a three-column grid | The application has no other store photos |
| 131:19123 | The approved state uses the review layout, with the vendor card; a suspended vendor shows its reason and «reactivate» (primary); a rejected application shows its reason without actions | States the API has and Figma does not draw |
| 131:19351 | Commission hint says 0 to 100 percent (Figma 0 to 30), up to two decimals; it is sent in basis points | The API takes any whole number of basis points from 0 to 10000 |
| 131:19527 | The three reason chips fill the reason field with a full sentence the applicant can act on | The reason is shown to the applicant as written |
| 131:19710 | Suspension hint says it is seen by admins only (Figma: «reaches the vendor») | The API shows the suspension reason to admins only |
| All dialogs | Centred vertically (Figma top 160) | The shared Dialog component |
| Toasts | Built from DS «Toast» (16:561), bottom centre of the window for 4 s | No frame shows where toasts appear |

## Build differences, Sprint 2 dashboard: CAT-DSH-1 categories and JAZLA products (pending owner sign-off, not agreed)
| Frame | Difference | Why |
|---|---|---|
| 131:19875 | «Link» column shows the English name; «products» shows a dash; no paging footer is needed (all categories are loaded) | No slug or product count in the API |
| 131:19875 | «Reorder categories» switches the table to a reorder mode: drag a row, or use the up/down buttons; «save order» / «cancel» replace the header buttons | The frame shows the entry button only |
| 131:21038 | Dialog fields «category name» and «English name» (Figma «link», «in English without spaces»); the same dialog adds a category | The API has `{ar, en}` names and no slug |
| 131:21286 | Header has «add product» and «categories» (the frame's actions slot is empty); an «available» switch column (80) for JAZLA products, the product column 250 instead of 300; the date column is «added on»; a paging footer | Routes to the form and to categories; the availability quick toggle of the task; the card has no update date; cursor paging |
| 131:21286 | Rows of other vendors open nothing (they are reviewed in CAT-DSH-2); the «...» opens JAZLA products only | Admins edit only the platform vendor's products (API rule) |
| 131:22654 | Search and category filter act on the loaded page; the date filter is disabled | API gaps |
| 131:35405 | Name and description in Arabic and English side by side; meat type instead of SKU; hints say 2 to 100 and up to 1000 characters (Figma 60 and 300) | The API's fields and limits |
| 131:35405 | Up to 10 images (Figma 6); more than four thumbnails wrap; each has a remove button | The API allows 10 |
| 131:35405 | Size rows: Arabic label, English label, weight in grams, price, remove; no «enabled» badge | A size tag is `{ar, en}`; sizes have no on/off in the API |
| 131:35405 | Cutting styles: under the chips, a row per chosen cut with its extra price | The API prices each cut; the frame has no field for it |
| 131:35405 | Packaging: the API's vacuum bag, chilled tray, bags, no packaging, each with an editable extra price beside the checkbox (Figma: chilled carton, gift wrap, price in the label) | The API's packaging list |
| 131:35405 | Matrix rows are every active cutting style (not only the product's); a cell toggles a global rule for all products (the body says so); a forbidden pair the product offers is outlined red | Rules are global in the API |
| 131:35405 | A matrix click first asks for confirmation (DS Dialog) that the rule changes for every product | The rule is global in the API |
| 131:21038 | «Remove image» link under the category picture | The API allows removing it (`imageMediaId: null`); no frame shows how |
| 131:35405 | «Slaughtered on order», preparation time, minimum quantity, order days, daily quantity and pause date are disabled | API gaps |
| 131:35405, 131:35813 | Footer for a draft: «save and publish» (primary), «save as draft»; for a published product: «save changes»; «delete product» disabled. The new-product title is «new product» | JAZLA products are published directly by admins, not sent to review; no delete endpoint |
| 131:36439 | A size price error shows the message in the empty box (as drawn); other API errors show under their field | Same rule for every field |
| 131:37786 | Admin copy: «not allowed to manage products» with «back to the dashboard» (the frame's copy is the suspended vendor's) | This is the admin side; CAT-DSH-2 uses the vendor copy |

## Build differences, Sprint 2 dashboard: CAT-DSH-2 vendor products and the product review queue (pending owner sign-off, not agreed)
| Frame | Difference | Why |
|---|---|---|
| 131:25074 | «التوفر» badge: «متاح» for an available published product, «غير معروض» for an available draft, rejected or in-review product, «نفد المخزون» when switched off; the availability switch is in the row «⋯» menu (with edit, review notes, submit for review); the date column shows the creation date; a paging footer | The task's availability toggle and «submit for review» have no control in the frame; the card has no update date; cursor paging |
| 131:25074 | The warning notice counts the rejected products (one, two, few, many) | Generic for any count |
| 131:26222 | Search, category and availability filter the loaded page; the date filter is disabled | API gaps |
| 131:26015 | Shown when the vendor routes answer VENDOR_SUSPENDED, with the frame's copy; «عرض حالة الطلب» opens `/vendor/application` | A vendor session exists only after approval; suspension is the only vendor-session refusal (copy for a suspended store is an owner decision) |
| 131:38124 | One note card holding the admin's reason (Figma: three issues with titles and per-issue buttons); its button «تعديل المنتج» opens the form; «حذف المنتج» disabled; no «محاولات الإرسال» row | The API keeps one reason; no submission count; no delete endpoint |
| 131:38124 | Also shows a rejected edit of a published product (reason of the change request) | State the API has and Figma does not draw |
| 131:38367 | Approved text without «after editing the images and description» | The API does not say what changed |
| 131:22954 | «نوع الطلب» is «منتج جديد» or «تعديل منتج» (Figma: also «تعديل صور», «تعديل سعر»); the dialog lists the changed parts; rows 64 high (Figma 72), with a paging footer; the action column has no header | No kind on a change request; prices never go to review; shared DS table |
| 131:22954 | «معتمدة» and «مرفوضة» list the vendors' published and rejected products, with their creation date and a «عرض» button | No list of decided reviews in the API |
| 131:22954 | The products list header gets a «طلبات المراجعة» button to reach the queue; the pending count is the badge on «المنتجات» | No side-nav item for the queue in the frame |
| 131:23859 | Dialog rows: store, category, price from, sizes, cutting, packaging, and «التعديلات» for an edit; the preview is the proposed content for an edit; the chips fill a full sentence; centred vertically | The request's content is what will go live; shared dialog placement |
| 131:35405 (vendor) | Footer: «إرسال للمراجعة» and «حفظ كمسودة» for a new, draft or rejected product, «حفظ التعديلات» for a published one; read-only (no footer) under review, with a notice; a warning above the footer when a review-sensitive field changes; a notice while an edit waits for review | Vendor products are reviewed (API rules); the task's «will be re-reviewed» warning has no frame |

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
- No customer web design in the file since 2026-11-13 (removed at the owner's request). The web build tasks (`*-WEB-*`) have no screens to build from until the scope is confirmed with the client, and the public vendor-application pages went with it (redrawn on 2026-11-18 as part of the dashboard app, see above).
- (Closed 2026-11-18: exports are in `docs/design/exports/`.) No PNG exports of the key screens in `docs/design/<epic>/` (the DES tasks ask for them): they need a Figma export or API token, which the design session did not have.
- The kitchen role is one screen, the kitchen board, which is what KIT-DSH-1 asks for; its side menu now shows that one item only. The admin `مهام الطبخ` (cooking jobs: by day and status, manual assign, meat-sent action) was added on 2026-11-13 with loading, empty, error and permission-denied states; it is reached from a link row on the `المطابخ` screen, because the admin side menu had no item for it (added 2026-11-18).
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
