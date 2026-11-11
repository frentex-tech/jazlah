# Component API for screen scripts (written from the Figma file; read before writing a screen script)

Load with `await loadDS()` (reads variables, styles, tokens). Everything is Arabic RTL. `inst(id, props)` returns an instance; edit texts with `retext(node, "<default text>", "<new>")`. Instances cannot add or remove children: use `slot(inst, "<frame name>", async f => {...})` to detach and refill a slot.

| id | props (variants) | default texts you can retext |
|---|---|---|
| `button` | variant primary/secondary/ghost/danger, state default/pressed/disabled/loading, size L/S | "اطلب الآن" (helper: `button(label, variant, state, size)`) |
| `input` | state default/focused/filled/error/disabled | label "الاسم الكامل"; value "عبدالرحمن محمد" (filled/error) or placeholder "اكتب هنا"; hint "نص مساعد" / "هذا الحقل مطلوب" (error) (helper: `field(label, value, state, hint)`) |
| `phone-input` | state default/error/disabled | "رقم الجوال", "5X XXX XXXX", hint "سنرسل لك رمز التحقق" / "رقم الجوال غير مكتمل" |
| `otp-field` | state default/filled/error | hint "الرمز غير صحيح، حاول مرة أخرى" (error) |
| `chip` | state default/selected/disabled | "خروف نعيمي" (helper `chip(label, state)`) |
| `radio` `checkbox` `switch` | checked yes/no, state default/disabled | "إضافة تغليف هدية" |
| `stepper` | state default/min/disabled | qty "2" ("1" when min) |
| `tabs` | active 1/2/3 | "الوصف" "المكوّنات" "التقييمات" |
| `bottom-tab-bar` | active 1..4 (الرئيسية, الخدمات, الطلبات, حسابي) | |
| `toast` | type success/error/warning/info | message per type |
| `dialog` | type default/destructive | slot-free; texts "تأكيد الطلب؟", "حذف العنوان؟" and body |
| `bottom-sheet` | (single component) | title "اختر الحجم"; slot frame `content` ("المحتوى"); includes a primary button |
| `app-header` | type home/page, cart empty/filled | "عنوان الصفحة" (page), location line (home) |
| `search-bar` | state default/focused/filled | "ابحث عن لحوم أو متاجر" / "ريب آي" |
| `section-header` | (single) | title "الأكثر مبيعًا", link "الكل" |
| `badge` | type neutral/info/warning/success/danger/brand, size M/S | label per type |
| `card` | state default/selected | "عنوان البطاقة", "نص توضيحي قصير يصف محتوى البطاقة." |
| `product-card` | state default/unavailable (165 wide) | vendor "مجازر الفلاح", title "ريب آي بقري طازج", "500 جم · تقطيع شرائح", price "89.00", "ر.س" |
| `store-card` | (single, 104 wide) | "مجازر الفلاح", "4.8" |
| `category-tile` | (single) | "الأغنام" |
| `state-panel` | kind cart/orders/search/error/offline/denied | icon + title, body, button label |
| `skeleton-row` | (single) | |
| `map-pin` | type address/store/courier, state default/selected | |
| `status-timeline` | stage 1..5 | five step titles + times |
| dashboard: `nav-item`, `side-nav` (role admin/vendor/kitchen), `top-bar`, `page-header`, `kpi-card` (trend up/down), `data-table` (state default/loading/empty/error), `select` (default/filled/open/disabled), `filters-bar` (default/active), `form-section` (default/error), `form-actions` | | page-header "الطلبات" / "الطلبات / كل الطلبات" |

Templates: `mobileScreen({path, state, header, tab, pad, gap, bg})`, `webScreen({path, state, active})`, `dashScreen({path, role, title, crumb, state})`, all returning `{screen, body}`; `stateCopy(base, "Loading")` clones a screen as a state with an empty body; `screenSection(ctx, pageName, id, title, S => { S.main.push(...); S.states.push(...) })` lays a feature out (main screens row, states row, gap 80); `tap(node, targetScreen)` and `flowStart(page, screen, name)` for prototypes. Content helpers: `titleBlock`, `skeletonRows`, `spacer`, `field`, `button`, `chip`, `icon(name, size, colorKey, "regular"|"fill")` (Phosphor), `txt(str, textStyle, colorKey, {w, align})`, `frame(...)`, `rect`, `circle`, `chk(where, fgKey, bgKey, min)` to register every text/background pair, `contrastReport()` at the end.

Rules: colors only through variable keys (ink, ink-2, muted, paper, bg, sand, line, brand, brand-2, brand-deep, ember, gold-text, gold-light, success, danger, warning, info, *-bg). Text styles only: Display/XL, Display/L, Heading/H1..H3, Body/L, Body/M, Label/M, Caption. Spacing only 4,8,12,16,20,24,32,40,48; radius keys lg md sm pill. Arabic copy, Latin digits, prices "89.00 ر.س". `muted` for placeholders only on bg/paper; `muted-soft`/`gold-deco` only large text and decoration. Errors use `danger`, never `ember`. Tap targets at least 44. Every screen needs default, loading, empty and error states where relevant, built with `stateCopy`.
