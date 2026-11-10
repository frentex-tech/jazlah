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
// STF-DES-1 batch 2 (mobile): product detail with customization. Page 10 Customer App.
// Acceptance: an incompatible option is visibly disabled AND says why (inline reason line, and a tooltip when tapped).
const P = "10 Customer App"
ctx.y = await startY(P, ["sec-stf-product"])
const REASON = "غير متاح مع التقطيع المختار: الشرائح"

// section title with an optional helper line
async function head(title, note) {
  const f = frame("head", { gap: 4, w: 358 })
  add(f, await txt(title, "Heading/H3", "ink", { w: 358 }), "h")
  if (note) add(f, await txt(note, "Body/M", "ink-2", { w: 358 }), "h")
  return f
}
// a white card holding option rows
const box = () => frame("options", { w: 358, pad: 16, gap: 4, fill: "paper", stroke: "line", r: "md" })
// one radio/checkbox row. right = price text. disabled rows carry a reason line (ink-2); tip = tooltip shown after a tap on the disabled row
async function opt(kind, label, right, o = {}) {
  const w = 326
  const wrap = frame("option", { w, gap: 4, pad: o.tap ? 4 : 0, stroke: o.tap ? "ink" : null, sw: 2, r: o.tap ? "sm" : null })
  const iw = o.tap ? w - 8 : w
  if (o.tip) {
    const tip = frame("tooltip", { w: iw, pad: 12, gap: 8, fill: "ink", r: "md" })
    const t1 = frame("line", { dir: "HORIZONTAL", w: iw - 24, gap: 8, cross: "CENTER" })
    add(t1, await icon("info", 20, "paper")); add(t1, await txt(REASON, "Label/M", "paper", { w: iw - 60 }), "h"); add(tip, t1, "h")
    add(tip, await txt("غيّر التقطيع إلى «قطعة كاملة» أو «مكعبات» لاختيار هذا الخيار.", "Body/M", "paper", { w: iw - 24 }), "h")
    add(wrap, tip, "h"); chk("tooltip text", "paper", "ink")
  }
  const row = frame("row", { dir: "HORIZONTAL", w: iw, main: "SPACE_BETWEEN", cross: "CENTER" })
  const c = inst(kind, { checked: o.checked ? "yes" : "no", state: o.disabled ? "disabled" : "default" }); await retext(c, "إضافة تغليف هدية", label)
  add(row, c)
  if (right) add(row, await txt(right, "Body/M", o.disabled ? "muted-soft" : "ink-2"))
  add(wrap, row, "h")
  if (o.disabled) {
    const why = frame("reason", { dir: "HORIZONTAL", w: iw, gap: 8, cross: "CENTER", px: 4 })
    add(why, await icon("prohibit", 16, "ink-2")); add(why, await txt(REASON, "Body/M", "ink-2", { w: iw - 40 }), "h"); add(wrap, why, "h")
    chk("disabled option label (reason line present)", "muted-soft", "paper", 1.5); chk("reason line", "ink-2", "paper")
  } else if (right) chk("option price", "ink-2", "paper")
  return wrap
}

const S_ = {
  gallery: async b => { add(b, await photo(358, 240, 56, "lg", "gallery"), "h"); add(b, center(dots(0, 4)), "h") },
  info: async (b, st) => {
    const v = frame("vendor", { dir: "HORIZONTAL", w: 358, gap: 8, cross: "CENTER" })
    add(v, await icon("storefront", 20, "ink-2")); add(v, await txt("مجازر الفلاح", "Label/M", "ink-2"))
    add(v, await icon("star", 16, "gold-text", "fill")); add(v, await txt("4.8", "Body/M", "ink-2"))
    add(b, v, "h")
    add(b, await txt("ريب آي بقري طازج", "Heading/H1", "ink", { w: 358 }), "h")
    add(b, await txt("بقري محلي · الوزن يُحدَّد بعد التقطيع", "Body/M", "ink-2", { w: 358 }), "h")
    const f = frame("freshness", { dir: "HORIZONTAL", w: 358, gap: 12, px: 16, py: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
    add(f, await icon("thermometer", 24, "ink-2"))
    const c = frame("text", { gap: 4 })
    add(c, await bdg("brand", "ذُبح اليوم 6:30 ص")); add(c, await txt("يُبرَّد ويُسلَّم طازجًا خلال 3 ساعات", "Body/M", "ink-2", { w: 250 }))
    add(f, c); add(b, f, "h")
    chk("vendor", "ink-2", "bg"); chk("rating star", "gold-text", "bg", 3)
  },
  price: async (b, st) => {
    const c = frame("price breakdown", { w: 358, pad: 16, gap: 8, fill: "paper", stroke: "line", r: "md" })
    const line = async (k, v, strong) => { const r = frame("line", { dir: "HORIZONTAL", w: 326, main: "SPACE_BETWEEN", cross: "CENTER" }); add(r, await txt(k, strong ? "Heading/H3" : "Body/M", strong ? "ink" : "ink-2")); add(r, await txt(v, strong ? "Heading/H3" : "Body/M", "ink")); add(c, r, "h") }
    await line("1 كجم × 89.00 ر.س", "89.00 ر.س"); await line("التقطيع (شرائح)", "مجاني"); await line("التغليف المفرغ", "+5.00 ر.س")
    add(c, rect("divider", 326, 1, "line"), "h"); await line("الإجمالي", "94.00 ر.س", true)
    add(b, c, "h")
  },
  size: async (b, st) => {
    add(b, await head("الحجم", "مطلوب · اختر واحدًا"), "h")
    const a = []; for (const [l, s] of [["500 جم", "default"], ["1 كجم", "selected"], ["2 كجم", st === "oos" ? "disabled" : "default"]]) a.push(await chip(l, st === "oos" ? "disabled" : s))
    add(b, rowOf(a, 358, { gap: 8 }), "h")
  },
  cut: async (b, st) => {
    add(b, await head("التقطيع", "مطلوب · اختر واحدًا"), "h")
    const x = box()
    add(x, await opt("radio", "قطعة كاملة", "مجاني", { disabled: st === "oos" }), "h"); add(x, await opt("radio", "شرائح", "مجاني", { checked: true, disabled: st === "oos" }), "h")
    add(x, await opt("radio", "مكعبات", "+2.00 ر.س", { disabled: st === "oos" }), "h"); add(x, await opt("radio", "مفروم", "+2.00 ر.س", { disabled: st === "oos" }), "h")
    add(b, x, "h")
  },
  pack: async (b, st) => {
    add(b, await head("التغليف", "بعض الخيارات تتغيّر حسب التقطيع"), "h")
    const x = box()
    add(x, await opt("radio", "كيس عادي", "مجاني"), "h"); add(x, await opt("radio", "تغليف مفرغ", "+5.00 ر.س", { checked: true }), "h")
    add(x, await opt("radio", "صندوق هدية", "+15.00 ر.س", { disabled: true, tap: st === "tap", tip: st === "tap" }), "h")
    add(b, x, "h")
  },
  excl: async b => {
    add(b, await head("الاستثناءات", "اختياري · نُزيلها لك أثناء التقطيع"), "h")
    const x = box()
    add(x, await opt("checkbox", "بدون دهن", null, { checked: true }), "h"); add(x, await opt("checkbox", "بدون عظم"), "h"); add(x, await opt("checkbox", "بدون عصب"), "h")
    add(b, x, "h")
  },
  notes: async b => { add(b, await field("ملاحظات للجزّار (اختياري)", null, "default", "مثال: شرائح رفيعة وبدون تتبيل"), "h") },
  qty: async b => {
    const r = frame("quantity", { dir: "HORIZONTAL", w: 358, main: "SPACE_BETWEEN", cross: "CENTER" })
    add(r, await txt("الكمية", "Heading/H3")); add(r, inst("stepper", { state: "min" })); add(b, r, "h")
  },
}
const ORDER = ["gallery", "info", "price", "size", "cut", "pack", "excl", "notes", "qty"]

// sticky bottom bar: live total + add to cart
async function bar(total, label, btnState = "default", note) {
  const f = frame("sticky bar", { w: 390, px: 16, py: 12, gap: 8, fill: "paper", stroke: "line", cross: "MIN" })
  if (note) add(f, await txt(note, "Body/M", "ink-2", { w: 358 }), "h")
  const r = frame("row", { dir: "HORIZONTAL", w: 358, gap: 16, cross: "CENTER" })
  const t = frame("total", { gap: 0 })
  add(t, await txt("الإجمالي", "Body/M", "ink-2"))
  const pr = frame("price", { dir: "HORIZONTAL", gap: 4, cross: "MAX" })
  add(pr, await txt(total, "Heading/H1", btnState === "disabled" ? "ink-2" : "ink")); add(pr, await txt("ر.س", "Body/M", "ink-2")); add(t, pr)
  add(r, t); add(r, await button(label, "primary", btnState), "h"); add(f, r, "h")
  await shade(f); chk("bar total", "ink", "paper"); chk("bar label", "ink-2", "paper")
  return f
}
// a product screen. sections: list of keys. st: "tap" (tooltip) | "oos"
async function product(state, sections, o = {}) {
  const s = await mobileScreen({ path: "Product/Detail", state, header: { type: "page", title: "تفاصيل المنتج", cart: "filled" }, gap: 16 })
  if (o.notice) add(s.body, await notice(o.notice, 358, "warning"), "h")
  for (const k of sections) await S_[k](s.body, o.st)
  add(s.screen, await bar(o.total || "94.00", o.label || "أضف إلى السلة", o.btn || "default", o.note), "h")
  return s
}

const main = await product("Default", ORDER)
const scroll = await product("Scroll", ORDER); scrollify(scroll)
const tapped = await product("Incompatible option", ["cut", "pack"], { st: "tap" })
const oos = await product("Out of stock", ["gallery", "info", "size", "cut", "pack"], { st: "oos", notice: "هذا المنتج غير متاح حاليًا. يمكنك طلب إشعار عند توفره.", total: "0.00", label: "غير متاح", btn: "disabled" })

const load = await mobileScreen({ path: "Product/Detail", state: "Loading", header: { type: "page", title: "تفاصيل المنتج" } })
add(load.body, rect("gallery skeleton", 358, 240, "sand", "lg"), "h"); add(load.body, await skeletonRows(3), "h")
add(load.screen, await bar("0.00", "أضف إلى السلة", "disabled"), "h")
const err = await mobileScreen({ path: "Product/Detail", state: "Error", header: { type: "page", title: "تفاصيل المنتج" } })
add(err.body, await panel("error", "تعذّر تحميل المنتج", "حدث خطأ أثناء جلب تفاصيل المنتج. حاول مرة أخرى.", "إعادة المحاولة"), "h")
const sel = await mobileScreen({ path: "Product/Detail", state: "Add error", header: { type: "page", title: "تفاصيل المنتج", cart: "filled" }, gap: 16 })
add(sel.body, await head("التقطيع", "مطلوب · اختر واحدًا"), "h")
{ const e = frame("error line", { dir: "HORIZONTAL", w: 358, gap: 8, cross: "CENTER" }); add(e, await icon("warning", 20, "danger")); add(e, await txt("اختر طريقة التقطيع قبل الإضافة إلى السلة", "Label/M", "danger", { w: 322 }), "h"); add(sel.body, e, "h"); chk("add error", "danger", "bg") }
{ const x = box(); add(x, await opt("radio", "قطعة كاملة", "مجاني"), "h"); add(x, await opt("radio", "شرائح", "مجاني"), "h"); add(x, await opt("radio", "مكعبات", "+2.00 ر.س"), "h"); add(sel.body, x, "h") }
add(sel.screen, await bar("89.00", "أضف إلى السلة", "default"), "h")

await screenSection(ctx, P, "sec-stf-product", "تفاصيل المنتج · Product detail", async S => {
  S.main.push(main.screen, scroll.screen)
  S.states.push(tapped.screen, load.screen, oos.screen, err.screen, sel.screen)
})

print("✅ STF product done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
