// STF-DES-1 (see header below). Shared helpers first, then the screens.
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
