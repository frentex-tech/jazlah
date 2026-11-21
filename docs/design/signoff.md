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
| 410:39654, 410:40259 | The phone field, and the approved status body, show the masked number of the sign-in answer (`+966 5•• ••• 567`) | The dashboard never holds the full number |
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
| 131:24863 | Reached when a save or upload answers VENDOR_SUSPENDED: the fields keep their values but use the disabled style, and «حفظ التغييرات» is disabled (Figma: normal fields, save enabled). A suspended vendor opening the page is signed out with the reason (API rule) | Kept after the Sprint 2 design QA: the API has already ended the session and refuses every vendor call, so an enabled save could never work and would lose the edits on the next click |
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
| 131:16744, 131:18192 | A paging footer («n صفوف في هذه الصفحة», previous / next) under the vendors table | Cursor paging (the list can be long); no loading frame shows a footer, so none shows while loading |
| Every list frame (vendors, products, my products) | The Filters bar is 76 high, the fields row 44 (Figma 134, 178 with chips) | The extra height in Figma is an empty 8×100 `sp` frame inside the DS «Filters bar» (16:1645), most likely an accident; kept at 76 by the owner until the designer fixes the DS |
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
| 131:21874 | Without any filter, an empty products list says «لا توجد منتجات بعد» / «ستظهر هنا منتجات جزلة والمتاجر.» without a button; with filters it is the frame («لا توجد منتجات مطابقة», «مسح التصفية») | The frame's copy is for filtered results (same as the vendors list, 131:17362) |
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
| 131:26015 | The frame's layout with a suspended store's copy («متجرك موقوف مؤقتًا», contact support) and «تسجيل الدخول» (sign-in with the suspension reason) instead of «store under review» / «view application status»; shown when the vendor routes answer VENDOR_SUSPENDED | A vendor session exists only after approval, so «under review» cannot occur; suspension is the only vendor-session refusal and it ends the session (as on the store profile) |
| 131:38124 | One note card holding the admin's reason (Figma: three issues with titles and per-issue buttons); its button «تعديل المنتج» opens the form; «حذف المنتج» disabled; no «محاولات الإرسال» row | The API keeps one reason; no submission count; no delete endpoint |
| 131:38124 | Also shows a rejected edit of a published product (reason of the change request) | State the API has and Figma does not draw |
| 131:38124 (English) | The admin's reason shows as written, usually in Arabic | The reason is free text, sent once |
| 131:37786 (vendor) | The frame's title and body («لا يمكنك تعديل المنتجات الآن», «متجرك موقوف مؤقتًا. تواصل مع الدعم لإعادة التفعيل.»), with «تسجيل الدخول» as the button instead of «تواصل مع الدعم» | No vendor support contact is defined yet (#103); the session is already over, and the sign-in page says why |
| 131:38367 | Approved text without «after editing the images and description» | The API does not say what changed |
| 131:22954 | «نوع الطلب» is «منتج جديد» or «تعديل منتج» (Figma: also «تعديل صور», «تعديل سعر»); the dialog lists the changed parts; rows 64 high (Figma 72), with a paging footer; the action column has no header | No kind on a change request; prices never go to review; shared DS table |
| 131:22954 | «أُرسل» and «الانتظار» of a new product count from its creation date; an edit's row has no store if its product cannot be read | The card has no `submittedAt`; one unreadable product must not fail the queue |
| 131:22954 (English) | At 1440 the «Sent» date wraps to two lines («12 November / 2026») | English month names are longer than the 140 column of the frame |
| 131:22954 | A page holds up to 20 new products and 20 edits, merged newest first; previous / next move both lists; the «المنتجات» badge counts up to 50 («50+» beyond) and is read again after five minutes or a decision | No review-queue endpoint or count in the API (API gap B6, #52) |
| 131:22954 | «معتمدة» and «مرفوضة» list the vendors' published and rejected products, with their creation date and a «عرض» button | No list of decided reviews in the API |
| 131:22954 | The products list header gets a «طلبات المراجعة» button to reach the queue; the pending count is the badge on «المنتجات» | No side-nav item for the queue in the frame |
| 131:23859 | Dialog rows: store, category, price from, sizes, cutting, packaging, and «التعديلات» for an edit. For an edit the preview is what approval makes live: the proposed content with the live prices of the sizes and options the product already has (new ones at the request's prices), cut names from the cutting styles; the chips fill a full sentence; centred vertically | Approval keeps live prices (API rule) and a request's cuttings carry no names; shared dialog placement |
| 131:35405 (vendor) | Footer: «إرسال للمراجعة» and «حفظ كمسودة» for a new, draft or rejected product, «حفظ التعديلات» for a published one; read-only (no footer) under review, with a notice; a warning above the footer when a review-sensitive field changes; a notice while an edit waits for review | Vendor products are reviewed (API rules); the task's «will be re-reviewed» warning has no frame |

## Build differences, Sprint 3 dashboard: SCH-DSH-1 operations settings and per-vendor capacity (pending owner sign-off, not agreed)
| Frame | Difference | Why |
|---|---|---|
| 118:11181 (all states) | Links drawn as DS Tabs «التشغيل» / «مناطق التغطية» under the page header (also on coverage zones) | The frames have no settings menu; `/admin/settings` still opens coverage zones until SCH-API-1 is wired (#70) |
| 118:11181 | The pause card's message box has a second field «الرسالة بالإنجليزية»; while paused both fields are read-only (the message changes only when pausing; «حفظ التغييرات» does not save it) | `ops.paused` holds `messageAr` and `messageEn`; every UI string is AR and EN |
| 118:11181 | «السعة اليومية وآخر وقت للطلب» adds four «أيام التجهيز المسبق» fields (one per order type) under the four cutoff times | `ops.cutoffs` has `leadDays` per type; the frame shows only the times |
| 118:11181 | Three extra form sections before the form actions: «الحد الأدنى للطلب ورسوم التوصيل», «الدفع عند الاستلام» (switch, maximum, confirmation, allowed order types), «فترة الشكاوى» | In the task's output (`ops.minOrderHalalas`, `ops.deliveryFeeHalalas`, `ops.cod`, `ops.complaintWindowHours`) but not drawn; built from Form section, Input, Select, Switch, Checkbox |
| 118:11181 | Closed-day list rows add the scope («التوصيل فقط», «الاستلام فقط») when it is not both; «إضافة يوم مغلق» and a click on a coming day open a dialog (date, scope, AR and EN reason); the calendar marks closed days only, the «مكتمل» and «انتهى وقت الطلب» legend rows are kept but no day carries them | `ops.closedDays` has a scope and two reasons; the add dialog has no frame; the API has no admin view of full days |
| 118:11181 | Seeded working hours 8:00 ص – 10:00 م; the delivery preview reads «يصل بين 4 و 6 مساءً» from the window | Weekly hours are not an `ops.*` key (API gap, docs/frontend/not-built-yet.md) |
| every admin page | An always-visible «إيقاف كل الطلبات» switch in the top bar before the user (with a «الطلبات متوقفة» badge while paused) and a warning banner «استقبال الطلبات متوقف. يرى العملاء: «…»» above every page while paused | Task output: the pause state must be visible on every admin page; the frames show the switch only on this page |
| 118:12270 | From the header the confirmation is 520 wide with the AR and EN message fields; resuming has its own dialog «استئناف استقبال الطلبات؟» (primary «استئناف الآن»); dialogs are centred vertically | The header has no message box; the resume confirmation has no frame; shared dialog placement |
| 118:11833 | The pause icon and badge use the warning colour token as drawn; the copy wraps to two lines at 1440 in Readex Pro | Build font is wider than Thmanyah |
| no frame | Vendor page (`/admin/vendors/[id]`) gets tabs «بيانات المتجر» / «السعة» for an active or suspended vendor; «السعة»: a Form section with the vendor's daily orders and carcasses (empty = platform default, shown in the hint) and «حفظ السعة», and a Form section «تواريخ محددة» with a Data table (date, orders limit, carcasses limit, booked) and «إضافة تاريخ» (dialog: date, two limits) | Task output (per-vendor capacity override); no Figma frame, built from the DS and the operations page patterns |

## Build differences, Sprint 3 dashboard: ORD-DSH-1 orders board and order detail (pending owner sign-off, not agreed)
| Frame | Difference | Why |
|---|---|---|
| 135:47501, 135:47767 | No selection checkbox column (the order number column takes its width); a cursor paging footer («n صفوف في هذه الصفحة», previous / next) instead of page numbers and «عرض 1 إلى 7 من 128» | No bulk action exists (export has no API); cursor paging as on the other lists |
| 135:47501 | Order numbers are `JZ-YYMMDD-XXXX` (Figma «#10482»), also in the detail title, breadcrumb and label; the date column is the delivery date | ORD-API-1 numbering; the delivery day is what both panels work by |
| 135:47501 | Status names: `confirmed` reads «جديد» (brand, as drawn), `new` reads «بانتظار التأكيد» (a COD order waiting for review), plus the other ORD-API-2 statuses; the store column and filter exist for admins only | ORD-API-2 statuses; vendors see only their orders |
| 135:47501 | The date filter is the native date picker (the «التاريخ» label shows while empty); «تصدير» is disabled | Single delivery-date filter (ORD-API-3); no export API |
| 135:48111, 135:49759 | Loading shows the panel loading body (as drawn) on the first load only; changing filters keeps the bar and shows table skeleton rows | The filters stay usable |
| 135:48353 | Without any filter, an empty board reads «لا توجد طلبات بعد» without the «مسح المرشحات» action | Nothing to clear |
| 135:48353 | When filters find nothing, the filters bar (search, selects, chips) stays above the empty card; the frame shows the card alone | A search that matches nothing must keep its field, focus and text, and single chips stay removable |
| new rows | A row that arrives live is tinted gold-bg and fades over 4 s (steady under reduced motion), and is announced to screen readers; no sound | Task output: a new order appears without refresh; no frame draws it |
| 135:49134 | Product rows add a caption with the options (size · cut · packaging · without …); the payment card adds rows when present: discount, from the wallet, refunds, delivery slot, customer notes, cancellation reason; the customer phone is a call link; the delivery-fee row is left out for pickup | Task output (options, contact, notes, refund); no frame draws them |
| 135:49134 | The status card adds, under the timeline, the moves the state machine allows (first primary, others secondary) and, for an admin and a COD order waiting for review, a sand notice with «تأكيد الطلب» / «رفض الطلب»; the timeline adds a first step for an unconfirmed order and a danger step for cancelled, failed or returned orders; pickup orders end on «استلمه العميل» | Task output (transitions, COD review); the timeline frame shows the delivery path only |
| 135:49134 | Vendors see no «إلغاء واسترداد» or «إعادة جدولة» (admin actions); both are disabled once the order has left the store; the pickup map card reads «موقع الاستلام» | Admin-only actions per the task; ORD-API-2 |
| 135:49317 | The cancel dialog is 520 wide with a refund choice (chips: the payment method / «محفظة العميل») when something was paid, and a required «سبب الإلغاء» field; the body follows the choice (wallet: «سيُضاف مبلغ … إلى محفظة العميل فورًا.», nothing paid: «لا يوجد مبلغ مدفوع لاسترداده.»); the COD reject reuses it with its own title and text; dialogs are centred on the screen | PAY-API-1 / WAL-API-1 refund to wallet or original method; the reason is the order's `cancelReason` |
| 135:49465 | The reschedule dialog is 520 wide with a «اليوم الجديد» select of the days on offer (unavailable days disabled with the reason, the current day marked); the body text follows the chosen day | The frame has no day picker |
| 135:49613 | The label rows are order number, customer, store, «موعد التوصيل» (or «موعد الاستلام») and weight (sum of the item sizes); the frame's «وقت الذبح» is not shown; the barcode is Code 39 of the order number; «طباعة» and «رجوع للتفاصيل» under the card; printing shows only the label on an A6 page, without the «(معاينة)» title | No slaughter time in the order model; Code 39 needs no library |
| 135:49902 | The detail «empty» state reads «الطلب غير موجود» with «العودة للطلبات» (an unknown order, or another store's for a vendor) | The frame's «لا توجد طلبات بعد» does not fit a single order |
| vendor nav | «لوحة الطلبات» opens `/vendor/orders` and `/vendor` redirects there; the live board frame (135:39184) is VOP-DSH-1 | The sprint's vendor orders page |

## Build differences, Sprint 2 mobile: STF-MOB-1, STF-MOB-3, STF-MOB-4 (owner, 2026-11-21)
After the design QA (`reviews/qa-design-mobile-2.md`). Everything else follows Figma; the M1–M5 and M7 copy and layout findings were fixed in the build. The last two rows need a Figma update.

| Screen (node) | Figma | Build | Why |
|---|---|---|---|
| Every price (cards, total bar, price sheet, filter labels) | The Saudi riyal symbol (Thmanyah draws «ر.س» as the glyph) | The letters «ر.س» | Readex Pro has no riyal glyph. Kept until the font decision (Thmanyah licence) at the end of the build. |
| Home: stories row, points chip, delivery/pickup toggle, cart count (118-6999) | Drawn | Left out; the bell and cart buttons show with no count | Their features land in later sprints (stories and points Sprint 6, fulfilment choice Sprint 3, cart CRT-MOB-1); a control with nothing behind it would mislead. |
| Product: out of stock (118-9350) | «يمكنك طلب إشعار عند توفره.» | The sentence is left out | There is no "notify me" feature. |
| Product cards (118-7219) | «500 جم» with 89.00 | The card price is the cheapest size (49.50 for 500 g) | Figma's 89.00 is the 1 kg price; the card and the product page must agree (and the API's "from" price is the lowest size). |
| Filters sheet: sort (86-13223) | No sort control | A «الترتيب» chip group in the sheet, shown with the mock only | The task asks for sort and Figma has none. **Figma needs a sort control.** |
| Store page: name, rating and logo line (118-8184) | Placed at the left (x=17) | Aligned to the start (right in Arabic), as the minimum-order line below it | The frame is laid out left to right in an RTL screen. **Figma needs the frame fixed.** |

## Build differences, Sprint 3 mobile: CRT-MOB-1 cart (pending owner sign-off, not agreed)
Everything else follows the five cart frames (170-28564, 170-28643, 170-28708, 170-28782, 170-28847).

| Screen (node) | Figma | Build | Why |
|---|---|---|---|
| Cart (170-28564, 170-28847) | «ستكسب 338 نقطة» points strip | Left out | Loyalty points are Sprint 6 (LOY-MOB-1 #174); a number with nothing behind it would mislead. |
| Cart totals (170-28564, 170-28847) | «رسوم التوصيل» row (15.00) counted in the total | Shown and counted only once the fulfilment is delivery | CRT-API-1: the delivery fee is only shown once fulfilment = delivery, which is chosen at checkout (SCH-MOB-1 #71). |
| Below the minimum (170-28847) | Two lines of text | The same lines plus a thin progress bar (warning on sand) | The task asks for a minimum-order progress bar and the frame has none. **Figma needs the bar or a decision to drop it.** |
| «استبدال السلة؟» dialog | No frame | The design-system Dialog (title, body naming the current store, «استبدال» and «إلغاء») | No frame for the single-store rule. |
| Removing a line | No control (the stepper stops at 1) | Swipe the line away (red bin behind it); screen readers get a «حذف» action; an unavailable line's banner has «حذف» | No remove control in the frame. |
| Issue and merge banners | No frame | A warning (or info) banner above the lines with one action («موافق» takes the new price, «حذف» removes the line) | Price-changed and unavailable lines block checkout and need explaining. |
| Coupon applied | No frame | The field shows the code, «تم تطبيق الرمز …» under it, the button reads «إزالة»; a «الخصم (CODE)» row in the totals | No applied or error state for the coupon field; errors use the field's error state. |
| Line weight (170-28564, 170-28847) | «500 جم للقطعة» at quantity 2 and «نحو 1.5 كجم» at quantity 1 in 170-28564, but «500 جم للقطعة» at quantity 1 in 170-28847 | «{weight} للقطعة» when quantity > 1, «نحو {weight}» at quantity 1 | The two frames disagree; the build follows 170-28564. **Figma needs one rule.** |
| Add to cart success (product page) | No frame | The design-system success toast «أُضيفت القطعة إلى السلة» and the header badge count | No frame. |

## Build differences, Sprint 3 mobile: SCH-MOB-1 checkout step 1 (pending owner sign-off, not agreed)
Everything else follows the ten frames (118-9638, 118-9741, 118-9829, 118-10052, 118-10144, 118-10199, 118-10251, 118-10342, 118-10426, 118-10510).

| Screen (node) | Figma | Build | Why |
|---|---|---|---|
| Pickup card (118-9741) | «اتصال بالمتجر» button | Left out, and no directions button | The app has no URL launcher, so neither a call nor opening the maps app would work; the pickup point has no phone yet. |
| Delivery address (118-9638) | No way to add an address | «+ إضافة عنوان» link in the title row, opening the existing add-address flow and coming back | The task asks for adding an address inline. |
| Window card (all) | «يصل بين 4 و 6 مساءً» | The day's window from the server (the default 16:00 to 22:00 reads «يصل بين 4 و 10 مساءً») | Data, not design: the SCH-API-1 default window. |
| Uncovered address (118-9638) | Second line «بريدة، خارج نطاق التوصيل الحالي» | The address line (city, street) and the «خارج نطاق التغطية» pill | The pill already says it; the address has no such text. |
| Days error (118-10251) | Day strip still drawn above the error card | Only the error card | With no days loaded, drawing days would be invented. |
| Day key (118-9638; absent in 118-9741) | Closed, full and past cutoff, in delivery only | The reasons present in the days, in both methods, under the window card (hidden while a disabled day is explained) | One rule for both methods; the vendor closed and outside horizon reasons have no Figma text or icon (store front, calendar with a cross). |
| Default (118-9638) | Body scrolls to the button | The button stays at the bottom like the other nine frames | The other frames pin it. |
| Disabled days | Tapping one outlines it and shows the reason card (118-10342 …) | The same, plus a tooltip on long press and the reason in the screen reader label | The task asks every disabled day to explain why. |

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
