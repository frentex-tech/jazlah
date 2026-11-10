// STF-DES-1: shared helpers first, then the screens.
// ---- shared helpers for the STF-DES-1 batch (same block in every file; screens are Arabic RTL, built from components) ----
await loadDS()
const ctx = { y: 0 }
async function startY(pg, own) {
  await page(pg).loadAsync()
  const rest = page(pg).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  return rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0
}
const BADGE = { neutral: "جديد", info: "قيد المراجعة", warning: "قيد التجهيز", success: "تم التسليم", danger: "ملغي", brand: "ذُبح اليوم" }
const bdg = async (type, label, size = "S") => { const b = inst("badge", { type, size }); await retext(b, BADGE[type], label); return b }
// product card: vendor, title, meta, price; off = unavailable variant
async function pc(vendor, title, meta, price, off, badge) {
  const c = inst("product-card", { state: off ? "unavailable" : "default" })
  await retext(c, "مجازر الفلاح", vendor); await retext(c, "ريب آي بقري طازج", title); await retext(c, "500 جم · تقطيع شرائح", meta); await retext(c, "89.00", price)
  if (off) await retext(c, BADGE.warning, badge || "غير متاح حاليًا"); else if (badge) await retext(c, BADGE.brand, badge)
  return c
}
const PRODUCTS = [
  ["مجازر الفلاح", "ريب آي بقري طازج", "500 جم · تقطيع شرائح", "89.00"],
  ["ملحمة النخبة", "كبدة غنم طازجة", "500 جم · قطعة كاملة", "32.00"],
  ["مجازر الفلاح", "لحم غنم نعيمي مفروم", "1 كجم · مفروم ناعم", "74.00"],
  ["مزارع الواحة", "صدر دجاج بلدي", "1 كجم · بدون جلد", "38.00"],
  ["ملحمة النخبة", "ستيك تندرلوين", "400 جم · شرائح سميكة", "96.00"],
  ["مجازر الفلاح", "ضلوع غنم للمشاوي", "1 كجم · تقطيع وسط", "112.00"],
  ["مزارع الواحة", "فخذ غنم كامل", "2 كجم · قطعة كاملة", "165.00"],
  ["ملحمة النخبة", "كباب بقري متبّل", "750 جم · جاهز للشوي", "58.00"],
  ["مجازر الفلاح", "لحم رقبة بقري", "1 كجم · مكعبات", "69.00"],
  ["مزارع الواحة", "أجنحة دجاج", "1 كجم · بدون تتبيل", "29.00"],
]
const prods = async (n, off, from = 0) => { const a = []; for (let i = 0; i < n; i++) { const p = PRODUCTS[(from + i) % PRODUCTS.length]; a.push(await pc(...p, off)) } return a }
// horizontal row of items. clip=true makes a carousel that is cut at the edge
function rowOf(items, w, o = {}) {
  const r = frame("row", { dir: "HORIZONTAL", w, gap: o.gap == null ? 12 : o.gap, main: o.main || "MIN", cross: o.cross, clip: o.clip })
  items.forEach(i => add(r, i)); return r
}
function grid(items, cols, w, gap = 12) {
  const g = frame("grid", { w, gap })
  for (let i = 0; i < items.length; i += cols) add(g, rowOf(items.slice(i, i + cols), w, { gap }), "h")
  return g
}
function photo(w, h, size = 32, r = "lg", name = "photo") {
  const f = frame(name, { dir: "HORIZONTAL", w, h, main: "CENTER", cross: "CENTER", fill: "sand", r })
  return icon("image", size, "ink-2").then(i => { add(f, i); return f })
}
async function secHead(title, link) { const s = inst("section-header"); await retext(s, "الأكثر مبيعًا", title); if (link === false) { const l = s.findOne(n => n.name === "link"); if (l) l.visible = false } return s }
async function tiles(names, w, gap = 4) { const a = []; for (const n of names) { const t = inst("category-tile"); await retext(t, "الأغنام", n); a.push(t) } return a }
async function stores(names) { const a = []; for (const [n, r] of names) { const s = inst("store-card"); await retext(s, "مجازر الفلاح", n); await retext(s, "4.8", r); a.push(s) } return a }
const STORES = [["مجازر الفلاح", "4.8"], ["ملحمة النخبة", "4.7"], ["مزارع الواحة", "4.9"], ["لحوم الرياض", "4.6"]]
const CATS = ["الأغنام", "الأبقار", "الإبل", "الدواجن", "المفرومات", "المشويات", "العقائق", "الولائم", "الأضاحي", "المجمّدات", "الأسماك", "البهارات"]
const dots = (active, n = 3) => { const r = frame("dots", { dir: "HORIZONTAL", ltr: true, gap: 8, cross: "CENTER" }); for (let i = 0; i < n; i++) r.appendChild(i === active ? rect("dot", 28, 8, "ember", "pill") : rect("dot", 8, 8, "line", "pill")); return r }
// banner slide: brand-deep card with text and a photo placeholder
async function banner(title, sub, w = 358, h = 160, big = false) {
  const f = frame("banner", { dir: "HORIZONTAL", w, h, px: big ? 48 : 20, py: big ? 40 : 20, gap: big ? 48 : 16, fill: "brand-deep", r: "lg", cross: "CENTER", clip: true })
  const c = frame("text", { gap: big ? 16 : 8, w: big ? 640 : 190 })
  add(c, await txt(title, big ? "Display/XL" : "Heading/H1", "paper", { w: big ? 640 : 190 }), "h")
  add(c, await txt(sub, big ? "Body/L" : "Body/M", "gold-light", { w: big ? 640 : 190 }), "h")
  add(f, c)
  const sp = spacer(); add(f, sp); sp.layoutSizingHorizontal = "FILL"
  add(f, await photo(big ? 320 : 100, big ? 240 : 120, big ? 48 : 32, "md"))
  chk("banner title", "paper", "brand-deep"); chk("banner sub", "gold-light", "brand-deep")
  return f
}
// notice strip (closed / paused): warning-bg with ink text
async function notice(text, w = 358, icn = "clock") {
  const f = frame("notice", { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, cross: "CENTER", fill: "warning-bg", r: "md" })
  add(f, await icon(icn, 24, "ink")); add(f, await txt(text, "Body/M", "ink", { w: w - 76 }), "h")
  chk("notice text", "ink", "warning-bg"); return f
}
// dashed placeholder row for the post-launch pickup stories
async function storiesSlot(w = 358) {
  const f = frame("stories slot (hidden at launch)", { dir: "HORIZONTAL", w, h: 88, px: 16, gap: 12, cross: "CENTER", main: "CENTER", stroke: "ink-2", r: "lg" })
  f.dashPattern = [6, 4]
  add(f, await icon("clock-counter-clockwise", 24, "ink-2"))
  const c = frame("text", { gap: 4 })
  add(c, await txt("قصص الاستلام — لاحقًا", "Label/M", "ink")); add(c, await txt("صف محجوز، يظهر بعد الإطلاق", "Body/M", "ink-2"))
  add(f, c)
  chk("stories label", "ink", "bg"); chk("stories note", "ink-2", "bg"); return f
}
const PD = { cart: ["سلتك فارغة", "أضف منتجات من المتاجر وسنجهّزها لك طازجة.", "تصفّح المنتجات"], search: ["لا توجد نتائج", "جرّب كلمات أخرى أو غيّر عوامل التصفية.", "مسح التصفية"], error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], offline: ["لا يوجد اتصال بالإنترنت", "تحقق من اتصالك ثم أعد المحاولة.", "إعادة المحاولة"] }
// state-panel with new copy and (optionally) another Phosphor icon: ic = [name, colorKey]
async function panel(kind, title, body, cta, ic) {
  let p = inst("state-panel", { kind }); const d = PD[kind]
  await retext(p, d[0], title); await retext(p, d[1], body); await retext(p, d[2], cta)
  if (ic) { p = await slot(p, "icon", async s => add(s, await icon(ic[0], 40, ic[1]))); chk("panel icon", ic[1], "sand", 3) }
  return p
}
function skCard() {
  const c = frame("skeleton card", { w: 165, fill: "paper", stroke: "line", r: "md", clip: true })
  add(c, rect("img", 165, 120, "sand"), "h")
  const i = frame("lines", { pad: 12, gap: 8 }); add(i, rect("l1", 100, 12, "sand", "pill")); add(i, rect("l2", 141, 12, "sand", "pill")); add(i, rect("l3", 72, 12, "sand", "pill")); add(c, i, "h")
  return c
}
const skCards = n => Array.from({ length: n }, skCard)
function skTile() { const t = frame("skeleton tile", { w: 84, gap: 8, cross: "CENTER" }); t.appendChild(circle("c", 72, "sand")); t.appendChild(rect("l", 56, 12, "sand", "pill")); return t }
// make a screen taller than 844 so the whole scrolling body is visible (name it "— Scroll")
function scrollify(s) { s.body.layoutSizingVertical = "HUG"; s.screen.primaryAxisSizingMode = "AUTO"; s.body.clipsContent = false }
const center = (n, w = 358) => { const f = frame("center", { dir: "HORIZONTAL", w, main: "CENTER" }); f.appendChild(n); return f }
chk("ink on bg", "ink", "bg"); chk("ink-2 on bg", "ink-2", "bg"); chk("ink on paper", "ink", "paper"); chk("ink-2 on paper", "ink-2", "paper")
// STF-DES-1 batch 1 (mobile): home, category list, store page. Page 10 Customer App. States are separate frames (different content).
const P = "10 Customer App"
ctx.y = await startY(P, ["sec-stf-home", "sec-stf-category", "sec-stf-store"])

// ---- Home ---------------------------------------------------------------------------------------------
async function fillHome(b, closed) {
  add(b, inst("search-bar", { state: "default" }), "h")
  if (closed) add(b, await notice("المتاجر القريبة منك متوقفة مؤقتًا. تصفّح الآن واطلب عند عودتها."), "h")
  add(b, await banner("لحم طازج يصل في يومك", "ذُبح اليوم وتوصيل سريع من متاجر موثّقة"), "h")
  add(b, center(dots(0)), "h")
  add(b, await storiesSlot(), "h")
  add(b, await secHead("الأقسام"), "h")
  add(b, rowOf(await tiles(CATS.slice(0, 4)), 358, { main: "SPACE_BETWEEN", gap: 4 }), "h")
  add(b, await secHead("الأكثر مبيعًا"), "h")
  add(b, grid(await prods(4, closed), 2, 358), "h")
  add(b, await secHead("متاجر شريكة"), "h")
  add(b, rowOf(await stores(STORES.slice(0, 3)), 358, { main: "SPACE_BETWEEN" }), "h")
}
const home = await mobileScreen({ path: "Home/Home", header: { type: "home", cart: "filled" }, tab: "1" })
await fillHome(home.body, false)
const homeScroll = await mobileScreen({ path: "Home/Home", state: "Scroll", header: { type: "home", cart: "filled" }, tab: "1" })
await fillHome(homeScroll.body, false); scrollify(homeScroll)
const homeClosed = await mobileScreen({ path: "Home/Home", state: "Closed", header: { type: "home", cart: "empty" }, tab: "1" })
await fillHome(homeClosed.body, true)
const homeLoad = await mobileScreen({ path: "Home/Home", state: "Loading", header: { type: "home", cart: "empty" }, tab: "1" })
{ const b = homeLoad.body
  add(b, inst("search-bar", { state: "default" }), "h")
  add(b, rect("banner skeleton", 358, 160, "sand", "lg"), "h")
  add(b, rowOf([0, 1, 2, 3].map(skTile), 358, { main: "SPACE_BETWEEN", gap: 4 }), "h")
  add(b, grid(skCards(2), 2, 358), "h") }
const homeEmpty = await mobileScreen({ path: "Home/Home", state: "Empty", header: { type: "home", cart: "empty" }, tab: "1" })
add(homeEmpty.body, await panel("search", "لا توجد متاجر في منطقتك بعد", "نعمل على الوصول إلى حيّك قريبًا. جرّب عنوانًا آخر.", "تغيير العنوان", ["map-pin", "ink-2"]), "h")
const homeErr = await mobileScreen({ path: "Home/Home", state: "Error", header: { type: "home", cart: "empty" }, tab: "1" })
add(homeErr.body, await panel("error", "تعذّر تحميل الصفحة الرئيسية", "حدث خطأ أثناء جلب المتاجر والمنتجات. حاول مرة أخرى."), "h")
const homeOff = await mobileScreen({ path: "Home/Home", state: "Offline", header: { type: "home", cart: "empty" }, tab: "1" })
add(homeOff.body, await panel("offline", "لا يوجد اتصال بالإنترنت", "تحقق من اتصالك ثم أعد المحاولة."), "h")
await screenSection(ctx, P, "sec-stf-home", "الرئيسية · Home", async S => {
  S.main.push(home.screen, homeScroll.screen)
  S.states.push(homeLoad.screen, homeEmpty.screen, homeErr.screen, homeOff.screen, homeClosed.screen)
})

// ---- Category list --------------------------------------------------------------------------------------
async function fillCats(b) {
  add(b, await titleBlock("الأقسام", "اختر القسم الذي يناسب طلبك."), "h")
  const rows = frame("tiles", { w: 358, gap: 16 })
  for (let i = 0; i < CATS.length; i += 4) add(rows, rowOf(await tiles(CATS.slice(i, i + 4)), 358, { main: "SPACE_BETWEEN", gap: 4 }), "h")
  add(b, rows, "h")
}
const cat = await mobileScreen({ path: "Category/List", header: { type: "page", title: "الأقسام", cart: "filled" }, tab: "1" })
await fillCats(cat.body)
const catLoad = await mobileScreen({ path: "Category/List", state: "Loading", header: { type: "page", title: "الأقسام" }, tab: "1" })
{ const rows = frame("tiles", { w: 358, gap: 16 }); for (let i = 0; i < 3; i++) add(rows, rowOf([0, 1, 2, 3].map(skTile), 358, { main: "SPACE_BETWEEN", gap: 4 }), "h"); add(catLoad.body, rows, "h") }
const catEmpty = await mobileScreen({ path: "Category/List", state: "Empty", header: { type: "page", title: "الأقسام" }, tab: "1" })
add(catEmpty.body, await panel("search", "لا توجد أقسام متاحة", "لا تتوفر أقسام في منطقتك حاليًا. تحقق مرة أخرى قريبًا.", "العودة للرئيسية"), "h")
const catErr = await mobileScreen({ path: "Category/List", state: "Error", header: { type: "page", title: "الأقسام" }, tab: "1" })
add(catErr.body, await panel("error", "تعذّر تحميل الأقسام", "حدث خطأ أثناء جلب الأقسام. حاول مرة أخرى."), "h")
await screenSection(ctx, P, "sec-stf-category", "قائمة الأقسام · Category list", async S => {
  S.main.push(cat.screen)
  S.states.push(catLoad.screen, catEmpty.screen, catErr.screen)
})

// ---- Store page ------------------------------------------------------------------------------------------
async function storeTop(b, closed) {
  add(b, await photo(358, 140, 40, "lg", "cover"), "h")
  const head = frame("vendor", { dir: "HORIZONTAL", w: 358, gap: 12, cross: "CENTER" })
  const logo = frame("logo", { dir: "HORIZONTAL", w: 64, h: 64, main: "CENTER", cross: "CENTER", fill: "sand", stroke: "gold-deco", r: "pill" })
  add(logo, await icon("storefront", 28, "brand")); add(head, logo)
  const nm = frame("name", { gap: 4 })
  add(nm, await txt("مجازر الفلاح", "Heading/H1"))
  const rt = frame("rating", { dir: "HORIZONTAL", gap: 4, cross: "CENTER" })
  add(rt, await icon("star", 16, "gold-text", "fill")); add(rt, await txt("4.8 (320 تقييم)", "Body/M", "ink-2")); add(nm, rt)
  add(head, nm); add(b, head, "h")
  chk("rating star", "gold-text", "bg", 3)
  const bd = frame("badges", { dir: "HORIZONTAL", w: 358, gap: 8 })
  add(bd, closed ? await bdg("danger", "مغلق الآن") : await bdg("success", "مفتوح حتى 11:00 م")); add(bd, await bdg("info", "توصيل خلال 35 دقيقة")); add(b, bd, "h")
  const mn = frame("min order", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" })
  add(mn, await icon("package", 20, "ink-2")); add(mn, await txt("الحد الأدنى للطلب 50.00 ر.س", "Body/M", "ink-2")); add(b, mn)
  if (closed) add(b, await notice("المتجر مغلق الآن ويفتح غدًا 8:00 ص. يمكنك تصفّح المنتجات والطلب عند فتحه."), "h")
}
async function storeBody(b, closed) {
  await storeTop(b, closed)
  const chips = []; for (const [l, s] of [["الكل", "selected"], ["الأغنام", "default"], ["الأبقار", "default"], ["الدواجن", "default"]]) chips.push(await chip(l, s))
  add(b, rowOf(chips, 358, { clip: true, gap: 8 }), "h")
  add(b, grid(await prods(4, closed, 0), 2, 358), "h")
}
const store = await mobileScreen({ path: "Store/Store", header: { type: "page", title: "مجازر الفلاح", cart: "filled" }, gap: 12 })
await storeBody(store.body, false)
const storeScroll = await mobileScreen({ path: "Store/Store", state: "Scroll", header: { type: "page", title: "مجازر الفلاح", cart: "filled" }, gap: 12 })
await storeBody(storeScroll.body, false); scrollify(storeScroll)
const storeClosed = await mobileScreen({ path: "Store/Store", state: "Closed", header: { type: "page", title: "مجازر الفلاح" }, gap: 12 })
await storeBody(storeClosed.body, true)
const storeLoad = await mobileScreen({ path: "Store/Store", state: "Loading", header: { type: "page", title: "مجازر الفلاح" }, gap: 12 })
{ const b = storeLoad.body
  add(b, rect("cover skeleton", 358, 140, "sand", "lg"), "h"); add(b, await skeletonRows(1), "h"); add(b, grid(skCards(2), 2, 358), "h") }
const storeEmpty = await mobileScreen({ path: "Store/Store", state: "Empty", header: { type: "page", title: "مجازر الفلاح" }, gap: 12 })
await storeTop(storeEmpty.body, false)
add(storeEmpty.body, await panel("cart", "لا توجد منتجات حاليًا", "لم يضف هذا المتجر منتجات بعد. جرّب متجرًا آخر.", "تصفّح المتاجر"), "h")
const storeErr = await mobileScreen({ path: "Store/Store", state: "Error", header: { type: "page", title: "مجازر الفلاح" }, gap: 12 })
add(storeErr.body, await panel("error", "تعذّر تحميل المتجر", "حدث خطأ أثناء جلب بيانات المتجر. حاول مرة أخرى."), "h")
await screenSection(ctx, P, "sec-stf-store", "صفحة المتجر · Store page", async S => {
  S.main.push(store.screen, storeScroll.screen)
  S.states.push(storeLoad.screen, storeEmpty.screen, storeClosed.screen, storeErr.screen)
})

print("✅ STF home/category/store done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
