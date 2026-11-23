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
// STF-DES-1 batch 3 (mobile): search, results, filters bottom sheet. Page 10 Customer App.
const P = "10 Customer App"
ctx.y = await startY(P, ["sec-stf-search"])

const HDR = { type: "page", title: "البحث" }
const chips = async (labels, sel = []) => { const a = []; for (const l of labels) a.push(await chip(l, sel.includes(l) ? "selected" : "default")); return a }
const sbar = state => { const s = inst("search-bar", { state }); return s }

// ---- Search (default) ------------------------------------------------------------------------------
async function fillSearch(b) {
  add(b, sbar("focused"), "h")
  const rh = frame("recent head", { dir: "HORIZONTAL", w: 358, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(rh, await txt("عمليات البحث الأخيرة", "Heading/H2")); add(rh, await txt("مسح", "Label/M", "ink-2")); add(b, rh, "h")
  add(b, rowOf(await chips(["ريب آي", "كبدة غنم", "مفروم بقري"]), 358, { gap: 8, clip: true }), "h")
  add(b, await txt("الأكثر بحثًا", "Heading/H2", "ink", { w: 358 }), "h")
  const list = frame("popular", { w: 358, gap: 4 })
  for (const t of ["لحم غنم نعيمي", "ضلوع غنم للمشاوي", "صدر دجاج بلدي", "كباب بقري متبّل"]) {
    const r = frame("row", { dir: "HORIZONTAL", w: 358, h: 44, gap: 12, cross: "CENTER" })
    add(r, await icon("trend-up", 20, "ink-2")); add(r, await txt(t, "Body/L", "ink", { w: 300 }), "h"); add(list, r, "h")
  }
  add(b, list, "h"); chk("recent clear", "ink-2", "bg")
}
const search = await mobileScreen({ path: "Search/Search", header: HDR })
await fillSearch(search.body)
const searchLoad = await mobileScreen({ path: "Search/Search", state: "Loading", header: HDR })
add(searchLoad.body, sbar("filled"), "h"); add(searchLoad.body, await skeletonRows(4), "h")

// ---- Results -----------------------------------------------------------------------------------------
async function resultsTop(b, count, filters) {
  add(b, sbar("filled"), "h")
  const bar = frame("result bar", { dir: "HORIZONTAL", w: 358, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(bar, await txt(count, "Body/M", "ink-2"))
  const fb = await button(filters ? "تصفية (2)" : "تصفية", "secondary", "default", "S"); add(bar, fb); add(b, bar, "h")
  if (filters) add(b, rowOf([await chip("حتى 100 ر.س", "selected"), await chip("المتاح الآن", "selected")], 358, { gap: 8, clip: true }), "h")
  return fb
}
const results = await mobileScreen({ path: "Search/Results", header: HDR, gap: 12 })
const filterBtn = await resultsTop(results.body, "24 نتيجة لـ «ريب آي»", true)
add(results.body, grid(await prods(4, false), 2, 358), "h")
const resLoad = await mobileScreen({ path: "Search/Results", state: "Loading", header: HDR, gap: 12 })
add(resLoad.body, sbar("filled"), "h"); add(resLoad.body, grid(skCards(4), 2, 358), "h")
const resEmpty = await mobileScreen({ path: "Search/Results", state: "No results", header: HDR, gap: 12 })
add(resEmpty.body, sbar("filled"), "h")
add(resEmpty.body, await panel("search", "لا توجد نتائج لـ «ريب آي»", "جرّب كلمات أخرى أو غيّر عوامل التصفية.", "مسح التصفية"), "h")
const resErr = await mobileScreen({ path: "Search/Results", state: "Error", header: HDR, gap: 12 })
add(resErr.body, sbar("filled"), "h"); add(resErr.body, await panel("error", "تعذّر تنفيذ البحث", "حدث خطأ أثناء البحث. حاول مرة أخرى."), "h")
const resOff = await mobileScreen({ path: "Search/Results", state: "Offline", header: HDR, gap: 12 })
add(resOff.body, sbar("filled"), "h"); add(resOff.body, await panel("offline", "لا يوجد اتصال بالإنترنت", "تحقق من اتصالك ثم أعد المحاولة."), "h")

// ---- Filters sheet over a dimmed results screen ---------------------------------------------------------
async function slider() {
  const f = frame("price range", { w: 342, gap: 8 })
  const track = frame("track", { dir: "HORIZONTAL", ltr: true, w: 342, h: 24, cross: "CENTER" })
  track.appendChild(rect("off", 40, 4, "line", "pill")); track.appendChild(circle("knob min", 24, "ember", { stroke: "paper", sw: 2 }))
  track.appendChild(rect("on", 170, 4, "ember", "pill")); track.appendChild(circle("knob max", 24, "ember", { stroke: "paper", sw: 2 })); track.appendChild(rect("off", 70, 4, "line", "pill"))
  add(f, track, "h")
  const lab = frame("labels", { dir: "HORIZONTAL", w: 342, main: "SPACE_BETWEEN" })
  add(lab, await txt("من 10.00 ر.س", "Body/M", "ink-2")); add(lab, await txt("إلى 100.00 ر.س", "Body/M", "ink-2")); add(f, lab, "h")
  return f
}
const filt = await mobileScreen({ path: "Search/Filters", header: HDR, gap: 12 })
await resultsTop(filt.body, "24 نتيجة لـ «ريب آي»", true)
add(filt.body, grid(await prods(2, false), 2, 358), "h")
const dim = rect("dim", 390, 844, "ink", null, { alpha: 0.5 }); filt.screen.appendChild(dim); dim.layoutPositioning = "ABSOLUTE"; dim.x = 0; dim.y = 0
let sheet = inst("bottom-sheet")
await retext(sheet, "اختر الحجم", "تصفية النتائج")
await retext(sheet, "اطلب الآن", "عرض 24 نتيجة")
sheet = await slot(sheet, "content", async s => {
  s.fills = []; s.primaryAxisSizingMode = "AUTO"; s.primaryAxisAlignItems = "MIN"; s.counterAxisAlignItems = "MAX"; bind(s, "itemSpacing", 16)
  const sec = async (t, node) => { const g = frame("group", { w: 342, gap: 8 }); add(g, await txt(t, "Heading/H3", "ink", { w: 342 }), "h"); add(g, node, "h"); add(s, g, "h") }
  await sec("السعر (ر.س)", await slider())
  await sec("المتجر", rowOf(await chips(["الكل", "مجازر الفلاح", "ملحمة النخبة"], ["الكل"]), 342, { gap: 8, clip: true }))
  await sec("القسم", rowOf(await chips(["الأبقار", "الأغنام", "الدواجن"], ["الأبقار"]), 342, { gap: 8, clip: true }))
  const k = inst("switch", { checked: "yes", state: "default" }); await retext(k, "إضافة تغليف هدية", "المتاح الآن فقط"); add(s, k)
})
add(sheet, await button("إعادة ضبط", "ghost"), "h")
filt.screen.appendChild(sheet); sheet.layoutPositioning = "ABSOLUTE"; sheet.x = 0; sheet.y = 844 - sheet.height
chk("sheet title", "ink", "paper")

await screenSection(ctx, P, "sec-stf-search", "البحث والتصفية · Search & filters", async S => {
  S.main.push(search.screen, results.screen, filt.screen)
  S.states.push(searchLoad.screen, resLoad.screen, resEmpty.screen, resErr.screen, resOff.screen)
})

print("✅ STF search done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
