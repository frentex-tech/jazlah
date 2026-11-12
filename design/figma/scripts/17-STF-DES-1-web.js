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
  await retext(p, d[0], title); await retext(p, d[1], body); if (cta != null) await retext(p, d[2], cta)
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
// STF-DES-1 batch 4 (web, 1440): home, category listing with filters sidebar, store, product detail, search results. Page 20 Customer Web.
const P = "20 Customer Web"
ctx.y = await startY(P, ["sec-stf-web-home", "sec-stf-web-category", "sec-stf-web-store", "sec-stf-web-product", "sec-stf-web-search"])
const W = 1200
const REASON = "غير متاح مع التقطيع المختار: الشرائح"
const web = (path, state, active = 0) => webScreen({ path, state, active })

// section heading row with an optional "all" link
async function wsec(title, link = true, w = W) {
  const r = frame("section head", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(r, await txt(title, "Heading/H1"))
  if (link) { const l = frame("link", { dir: "HORIZONTAL", gap: 4, cross: "CENTER" }); add(l, await txt("الكل", "Label/M", "ember")); add(l, await icon("caret-left", 16, "ember")); add(r, l); chk("web link", "ember", "bg") }
  return r
}
const gridW = (items, cols, w, gap) => { const g = frame("grid", { w, gap: 24 }); for (let i = 0; i < items.length; i += cols) add(g, rowOf(items.slice(i, i + cols), w, { gap }), "h"); return g }
const cardsOf = (n, off, skel) => skel ? Promise.resolve(skCards(n)) : prods(n, off)

// ---- filters sidebar (category listing and search) ---------------------------------------------------------
async function slider(w) {
  const f = frame("price range", { w, gap: 8 })
  const track = frame("track", { dir: "HORIZONTAL", ltr: true, w, h: 24, cross: "CENTER" })
  track.appendChild(rect("off", 32, 4, "line", "pill")); track.appendChild(circle("knob min", 24, "ember", { stroke: "paper", sw: 2 }))
  track.appendChild(rect("on", 110, 4, "ember", "pill")); track.appendChild(circle("knob max", 24, "ember", { stroke: "paper", sw: 2 })); track.appendChild(rect("off", 50, 4, "line", "pill"))
  add(f, track, "h")
  const lab = frame("labels", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN" })
  add(lab, await txt("من 10.00", "Body/M", "ink-2")); add(lab, await txt("إلى 100.00", "Body/M", "ink-2")); add(f, lab, "h")
  return f
}
async function sidebar() {
  const w = 280, iw = 240
  const f = frame("filters sidebar", { w, pad: 20, gap: 20, fill: "paper", stroke: "line", r: "md" })
  add(f, await txt("تصفية النتائج", "Heading/H2", "ink", { w: iw }), "h")
  const group = async (t, nodes) => { const g = frame("group", { w: iw, gap: 4 }); add(g, await txt(t, "Heading/H3", "ink", { w: iw }), "h"); nodes.forEach(n => add(g, n)); add(f, g, "h") }
  const cb = async (l, on) => { const c = inst("checkbox", { checked: on ? "yes" : "no", state: "default" }); await retext(c, "إضافة تغليف هدية", l); return c }
  await group("القسم", [await cb("الأغنام", true), await cb("الأبقار"), await cb("الدواجن")])
  await group("السعر (ر.س)", [await slider(iw)])
  await group("المتجر", [await cb("مجازر الفلاح", true), await cb("ملحمة النخبة"), await cb("مزارع الواحة")])
  const sw = inst("switch", { checked: "yes", state: "default" }); await retext(sw, "إضافة تغليف هدية", "المتاح الآن فقط"); await group("التوفر", [sw])
  add(f, await button("تطبيق", "primary"), "h"); add(f, await button("إعادة ضبط", "ghost"), "h")
  return f
}
// listing layout: sidebar on the right (RTL start), results on the left
async function listing(b, title, count, content) {
  const row = frame("listing", { dir: "HORIZONTAL", w: W, gap: 24, cross: "MIN" })
  add(row, await sidebar())
  const col = frame("results", { w: 896, gap: 24 })
  const h = frame("head", { dir: "HORIZONTAL", w: 896, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(h, await txt(title, "Heading/H1")); add(h, await txt(count, "Body/M", "ink-2")); add(col, h, "h")
  add(col, content, "h"); add(row, col); add(b, row, "h")
}
const listGrid = async (n, off, skel) => gridW(await cardsOf(n, off, skel), 5, 896, 12)

// ---- Home --------------------------------------------------------------------------------------------------
const home = await web("Home/Home", "Default")
{ const b = home.body
  add(b, await banner("لحم طازج يصل في يومك", "ذُبح اليوم وتوصيل سريع من متاجر موثّقة في مدينتك", W, 320, true), "h")
  add(b, await wsec("الأقسام"), "h")
  add(b, rowOf(await tiles(CATS.slice(0, 8)), W, { main: "SPACE_BETWEEN", gap: 4 }), "h")
  add(b, await wsec("الأكثر مبيعًا"), "h")
  add(b, gridW(await prods(6, false), 6, W, 40), "h")
  add(b, await wsec("متاجر شريكة"), "h")
  add(b, rowOf(await stores([...STORES, ...STORES]), W, { main: "SPACE_BETWEEN" }), "h") }
const homeLoad = await web("Home/Home", "Loading")
add(homeLoad.body, rect("banner skeleton", W, 320, "sand", "lg"), "h"); add(homeLoad.body, rowOf([0, 1, 2, 3, 4, 5, 6, 7].map(skTile), W, { main: "SPACE_BETWEEN", gap: 4 }), "h"); add(homeLoad.body, gridW(skCards(6), 6, W, 40), "h")
const homeEmpty = await web("Home/Home", "Empty")
add(homeEmpty.body, center(await panel("search", "لا توجد متاجر في منطقتك بعد", "نعمل على الوصول إلى حيّك قريبًا. جرّب عنوانًا آخر.", "تغيير العنوان", ["map-pin", "ink-2"]), W), "h")
const homeErr = await web("Home/Home", "Error")
add(homeErr.body, center(await panel("error", "تعذّر تحميل الصفحة الرئيسية", "حدث خطأ أثناء جلب المتاجر والمنتجات. حاول مرة أخرى."), W), "h")
await screenSection(ctx, P, "sec-stf-web-home", "الرئيسية · Web home", async S => { S.main.push(home.screen); S.states.push(homeLoad.screen, homeEmpty.screen, homeErr.screen) })

// ---- Category listing -----------------------------------------------------------------------------------------
const cat = await web("Category/List", "Default")
await listing(cat.body, "الأغنام", "48 منتجًا", await listGrid(10))
const catLoad = await web("Category/List", "Loading")
await listing(catLoad.body, "الأغنام", "", await listGrid(10, false, true))
const catEmpty = await web("Category/List", "Empty")
await listing(catEmpty.body, "الأغنام", "0 منتج", center(await panel("search", "لا توجد منتجات في هذا القسم", "جرّب قسمًا آخر أو غيّر عوامل التصفية.", "مسح التصفية"), 896))
const catErr = await web("Category/List", "Error")
await listing(catErr.body, "الأغنام", "", center(await panel("error", "تعذّر تحميل المنتجات", "حدث خطأ أثناء جلب المنتجات. حاول مرة أخرى."), 896))
await screenSection(ctx, P, "sec-stf-web-category", "قائمة الأقسام · Web category listing", async S => { S.main.push(cat.screen); S.states.push(catLoad.screen, catEmpty.screen, catErr.screen) })

// ---- Store -------------------------------------------------------------------------------------------------------
async function storeTop(b, closed) {
  add(b, await photo(W, 200, 56, "lg", "cover"), "h")
  const head = frame("vendor", { dir: "HORIZONTAL", w: W, gap: 20, cross: "CENTER" })
  const logo = frame("logo", { dir: "HORIZONTAL", w: 80, h: 80, main: "CENTER", cross: "CENTER", fill: "sand", stroke: "gold-deco", r: "pill" })
  add(logo, await icon("storefront", 36, "brand")); add(head, logo)
  const nm = frame("name", { gap: 8 })
  add(nm, await txt("مجازر الفلاح", "Display/L"))
  const rt = frame("meta", { dir: "HORIZONTAL", gap: 12, cross: "CENTER" })
  add(rt, await icon("star", 16, "gold-text", "fill")); add(rt, await txt("4.8 (320 تقييم)", "Body/M", "ink-2"))
  add(rt, closed ? await bdg("danger", "مغلق الآن") : await bdg("success", "مفتوح حتى 11:00 م")); add(rt, await bdg("info", "توصيل خلال 35 دقيقة")); add(rt, await txt("الحد الأدنى للطلب 50.00 ر.س", "Body/M", "ink-2"))
  add(nm, rt); add(head, nm); add(b, head, "h")
  chk("web rating star", "gold-text", "bg", 3)
  if (closed) add(b, await notice("المتجر مغلق الآن ويفتح غدًا 8:00 ص. يمكنك تصفّح المنتجات والطلب عند فتحه.", W), "h")
}
const storeChips = async () => { const a = []; for (const [l, s] of [["الكل", "selected"], ["الأغنام", "default"], ["الأبقار", "default"], ["الدواجن", "default"], ["المفرومات", "default"]]) a.push(await chip(l, s)); return rowOf(a, W, { gap: 8 }) }
const store = await web("Store/Store", "Default", 1)
await storeTop(store.body, false); add(store.body, await storeChips(), "h"); add(store.body, gridW(await prods(12, false), 6, W, 40), "h")
const storeLoad = await web("Store/Store", "Loading", 1)
add(storeLoad.body, rect("cover skeleton", W, 200, "sand", "lg"), "h"); add(storeLoad.body, await skeletonRows(1), "h"); add(storeLoad.body, gridW(skCards(6), 6, W, 40), "h")
const storeEmpty = await web("Store/Store", "Empty", 1)
await storeTop(storeEmpty.body, false)
add(storeEmpty.body, center(await panel("cart", "لا توجد منتجات حاليًا", "لم يضف هذا المتجر منتجات بعد. جرّب متجرًا آخر.", "تصفّح المتاجر"), W), "h")
const storeClosed = await web("Store/Store", "Closed", 1)
await storeTop(storeClosed.body, true); add(storeClosed.body, gridW(await prods(6, true), 6, W, 40), "h")
const storeErr = await web("Store/Store", "Error", 1)
add(storeErr.body, center(await panel("error", "تعذّر تحميل المتجر", "حدث خطأ أثناء جلب بيانات المتجر. حاول مرة أخرى."), W), "h")
await screenSection(ctx, P, "sec-stf-web-store", "صفحة المتجر · Web store", async S => { S.main.push(store.screen); S.states.push(storeLoad.screen, storeEmpty.screen, storeClosed.screen, storeErr.screen) })

// ---- Product detail --------------------------------------------------------------------------------------------------
const OW = 428 // option row width in the options column (460 - padding)
async function head(title, note) {
  const f = frame("head", { gap: 4, w: 460 })
  add(f, await txt(title, "Heading/H3", "ink", { w: 460 }), "h")
  if (note) add(f, await txt(note, "Body/M", "ink-2", { w: 460 }), "h")
  return f
}
const box = () => frame("options", { w: 460, pad: 16, gap: 4, fill: "paper", stroke: "line", r: "md" })
async function opt(kind, label, right, o = {}) {
  const w = OW, iw = o.tap ? w - 8 : w
  const wrap = frame("option", { w, gap: 4, pad: o.tap ? 4 : 0, stroke: o.tap ? "ink" : null, sw: 2, r: o.tap ? "sm" : null })
  if (o.tap) {
    const tip = frame("tooltip", { w: iw, pad: 12, gap: 8, fill: "ink", r: "md" })
    const t1 = frame("line", { dir: "HORIZONTAL", w: iw - 24, gap: 8, cross: "CENTER" })
    add(t1, await icon("info", 20, "paper")); add(t1, await txt(REASON, "Label/M", "paper", { w: iw - 60 }), "h"); add(tip, t1, "h")
    add(tip, await txt("غيّر التقطيع إلى «قطعة كاملة» أو «مكعبات» لاختيار هذا الخيار.", "Body/M", "paper", { w: iw - 24 }), "h")
    add(wrap, tip, "h"); chk("web tooltip", "paper", "ink")
  }
  const row = frame("row", { dir: "HORIZONTAL", w: iw, main: "SPACE_BETWEEN", cross: "CENTER" })
  const c = inst(kind, { checked: o.checked ? "yes" : "no", state: o.disabled ? "disabled" : "default" }); await retext(c, "إضافة تغليف هدية", label); add(row, c)
  if (right) add(row, await txt(right, "Body/M", o.disabled ? "muted-soft" : "ink-2"))
  add(wrap, row, "h")
  if (o.disabled) {
    const why = frame("reason", { dir: "HORIZONTAL", w: iw, gap: 8, cross: "CENTER", px: 4 })
    add(why, await icon("prohibit", 16, "ink-2")); add(why, await txt(REASON, "Body/M", "ink-2", { w: iw - 40 }), "h"); add(wrap, why, "h")
    chk("web disabled option (reason line present)", "muted-soft", "paper", 1.5); chk("web reason line", "ink-2", "paper")
  } else if (right) chk("web option price", "ink-2", "paper")
  return wrap
}
async function options(col, tap) {
  const v = frame("vendor", { dir: "HORIZONTAL", w: 460, gap: 8, cross: "CENTER" })
  add(v, await icon("storefront", 20, "ink-2")); add(v, await txt("مجازر الفلاح", "Label/M", "ink-2")); add(v, await icon("star", 16, "gold-text", "fill")); add(v, await txt("4.8", "Body/M", "ink-2")); add(col, v, "h")
  add(col, await txt("ريب آي بقري طازج", "Display/L", "ink", { w: 460 }), "h")
  const fr = frame("freshness", { dir: "HORIZONTAL", w: 460, gap: 12, px: 16, py: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  add(fr, await icon("thermometer", 24, "ink-2")); add(fr, await bdg("brand", "ذُبح اليوم 6:30 ص")); add(fr, await txt("يُبرَّد ويُسلَّم طازجًا", "Body/M", "ink-2")); add(col, fr, "h")
  add(col, await head("الحجم", "مطلوب · اختر واحدًا"), "h")
  add(col, rowOf([await chip("500 جم"), await chip("1 كجم", "selected"), await chip("2 كجم")], 460, { gap: 8 }), "h")
  add(col, await head("التقطيع", "مطلوب · اختر واحدًا"), "h")
  { const x = box(); for (const [l, r, c] of [["قطعة كاملة", "مجاني"], ["شرائح", "مجاني", true], ["مكعبات", "+2.00 ر.س"], ["مفروم", "+2.00 ر.س"]]) add(x, await opt("radio", l, r, { checked: c }), "h"); add(col, x, "h") }
  add(col, await head("التغليف", "بعض الخيارات تتغيّر حسب التقطيع"), "h")
  { const x = box(); add(x, await opt("radio", "كيس عادي", "مجاني"), "h"); add(x, await opt("radio", "تغليف مفرغ", "+5.00 ر.س", { checked: true }), "h"); add(x, await opt("radio", "صندوق هدية", "+15.00 ر.س", { disabled: true, tap }), "h"); add(col, x, "h") }
  add(col, await head("الاستثناءات", "اختياري"), "h")
  { const x = box(); add(x, await opt("checkbox", "بدون دهن", null, { checked: true }), "h"); add(x, await opt("checkbox", "بدون عظم"), "h"); add(x, await opt("checkbox", "بدون عصب"), "h"); add(col, x, "h") }
  add(col, await field("ملاحظات للجزّار (اختياري)", null, "default", "مثال: شرائح رفيعة وبدون تتبيل"), "h")
}
async function summary(disabled) {
  const c = frame("summary (sticky)", { w: 260, pad: 20, gap: 16, fill: "paper", stroke: "line", r: "md" }); await shade(c)
  add(c, await txt("ملخص الطلب", "Heading/H2", "ink", { w: 220 }), "h")
  const line = async (k, v, strong) => { const r = frame("line", { dir: "HORIZONTAL", w: 220, main: "SPACE_BETWEEN", cross: "CENTER" }); add(r, await txt(k, strong ? "Heading/H3" : "Body/M", strong ? "ink" : "ink-2")); add(r, await txt(v, strong ? "Heading/H3" : "Body/M", "ink")); add(c, r, "h") }
  await line("1 كجم", "89.00 ر.س"); await line("التقطيع", "مجاني"); await line("التغليف المفرغ", "+5.00 ر.س")
  add(c, rect("divider", 220, 1, "line"), "h")
  const q = frame("quantity", { dir: "HORIZONTAL", w: 220, main: "SPACE_BETWEEN", cross: "CENTER" }); add(q, await txt("الكمية", "Body/M", "ink-2")); add(q, inst("stepper", { state: disabled ? "disabled" : "min" })); add(c, q, "h")
  await line("الإجمالي", disabled ? "0.00 ر.س" : "94.00 ر.س", true)
  add(c, await button(disabled ? "غير متاح" : "أضف إلى السلة", "primary", disabled ? "disabled" : "default"), "h")
  const d = frame("delivery", { dir: "HORIZONTAL", w: 220, gap: 8, cross: "CENTER" }); add(d, await icon("truck", 20, "ink-2")); add(d, await txt("توصيل غدًا 10:00 – 12:00", "Body/M", "ink-2", { w: 190 }), "h"); add(c, d, "h")
  chk("web summary", "ink", "paper"); chk("web summary label", "ink-2", "paper")
  return c
}
async function productScreen(state, o = {}) {
  const s = await web("Product/Detail", state, 1)
  const row = frame("product", { dir: "HORIZONTAL", w: W, gap: 20, cross: "MIN" })
  const g = frame("gallery", { w: 440, gap: 12 }); add(g, await photo(440, 400, 64, "lg", "gallery"), "h")
  const th = []; for (let i = 0; i < 4; i++) th.push(await photo(96, 96, 24, "md", "thumb")); add(g, rowOf(th, 440, { gap: 8 }), "h")
  const col = frame("options", { w: 460, gap: 16 }); await options(col, o.tap)
  add(row, g); add(row, col); add(row, await summary(o.oos)); add(s.body, row, "h")
  return s
}
const prod = await productScreen("Default")
const prodTap = await productScreen("Incompatible option", { tap: true })
const prodOos = await productScreen("Out of stock", { oos: true })
const prodLoad = await web("Product/Detail", "Loading", 1)
{ const row = frame("product", { dir: "HORIZONTAL", w: W, gap: 20, cross: "MIN" }); add(row, rect("gallery skeleton", 440, 400, "sand", "lg")); const c = frame("lines", { w: 460, gap: 16 }); add(c, await skeletonRows(4), "h"); add(row, c); add(row, rect("summary skeleton", 260, 320, "sand", "md")); add(prodLoad.body, row, "h") }
const prodErr = await web("Product/Detail", "Error", 1)
add(prodErr.body, center(await panel("error", "تعذّر تحميل المنتج", "حدث خطأ أثناء جلب تفاصيل المنتج. حاول مرة أخرى."), W), "h")
await screenSection(ctx, P, "sec-stf-web-product", "تفاصيل المنتج · Web product detail", async S => { S.main.push(prod.screen, prodTap.screen); S.states.push(prodOos.screen, prodLoad.screen, prodErr.screen) })

// ---- Search results --------------------------------------------------------------------------------------------------------
const res = await web("Search/Results", "Default")
await listing(res.body, "نتائج «ريب آي»", "24 نتيجة", await listGrid(10))
const resLoad = await web("Search/Results", "Loading")
await listing(resLoad.body, "نتائج «ريب آي»", "", await listGrid(10, false, true))
const resEmpty = await web("Search/Results", "No results")
await listing(resEmpty.body, "نتائج «ريب آي»", "0 نتيجة", center(await panel("search", "لا توجد نتائج لـ «ريب آي»", "جرّب كلمات أخرى أو غيّر عوامل التصفية.", "مسح التصفية"), 896))
const resErr = await web("Search/Results", "Error")
await listing(resErr.body, "نتائج «ريب آي»", "", center(await panel("error", "تعذّر تنفيذ البحث", "حدث خطأ أثناء البحث. حاول مرة أخرى."), 896))
await screenSection(ctx, P, "sec-stf-web-search", "نتائج البحث · Web search results", async S => { S.main.push(res.screen); S.states.push(resLoad.screen, resEmpty.screen, resErr.screen) })

print("✅ STF web done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
