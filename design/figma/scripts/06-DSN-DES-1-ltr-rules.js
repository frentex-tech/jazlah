// DSN-DES-1, batch 5b: page 99 LTR Rules. Four key screens (home, product, checkout, admin table) designed once in Arabic (RTL),
// next to their English LTR counterparts. The English side is produced by cloning the Arabic frame, detaching instances, mirroring
// horizontal rows, flipping directional icons and swapping the copy: exactly what developers do with mirroring + i18n.
// Needs batches 1 to 3. Rebuilds the page sections in place.
await loadDS()
await page("90 Flows").loadAsync()
page("90 Flows").children.filter(n => n.type !== "SECTION").forEach(n => n.remove()) // strays left by a failed first run of batch 5a
const ctx = { y: 0 }
const P = "99 LTR Rules"

const EN = {
  "جزلة": "Jazlah", "التوصيل إلى الملقا، الرياض": "Deliver to Al Malqa, Riyadh", "عنوان الصفحة": "Page title", "ابحث عن لحوم أو متاجر": "Search meat or stores",
  "الأكثر مبيعًا": "Best sellers", "الكل": "All", "مجازر الفلاح": "Al Falah Butchery", "ريب آي بقري طازج": "Fresh beef ribeye", "500 جم · تقطيع شرائح": "500 g · sliced",
  "ر.س": "SAR", "ذُبح اليوم": "Slaughtered today", "قيد التجهيز": "Preparing", "تم التسليم": "Delivered", "ملغي": "Cancelled", "جديد": "New", "قيد المراجعة": "In review",
  "الرئيسية": "Home", "الخدمات": "Services", "الطلبات": "Orders", "حسابي": "Account",
  "الحجم": "Size", "الكمية": "Quantity", "المجموع": "Total", "أضف إلى السلة": "Add to cart", "500 جم": "500 g", "1 كجم": "1 kg", "2 كجم": "2 kg", "تفاصيل المنتج": "Product details",
  "طريقة الاستلام": "Fulfilment", "توصيل": "Delivery", "استلام من المتجر": "Store pickup", "عنوان التوصيل": "Delivery address", "الملقا، الرياض": "Al Malqa, Riyadh", "تغيير": "Change",
  "يوم التوصيل": "Delivery day", "الخميس": "Thursday", "الجمعة": "Friday", "السبت": "Saturday", "12 نوفمبر": "12 Nov", "13 نوفمبر": "13 Nov", "14 نوفمبر": "14 Nov", "مكتمل": "Full",
  "المنتجات": "Items", "التوصيل": "Delivery fee", "ضريبة القيمة المضافة 15%": "VAT 15%", "الإجمالي": "Total", "ادفع الآن": "Pay now", "الدفع": "Payment",
  "الطلبات / كل الطلبات": "Orders / All orders", "تصدير": "Export", "إضافة": "Add", "بحث": "Search", "التاريخ": "Date", "مسح الكل": "Clear all",
  "الحالة: قيد التجهيز": "Status: Preparing", "المتجر: مجازر الفلاح": "Store: Al Falah Butchery", "الحالة": "Status",
  "رقم الطلب": "Order no.", "العميل": "Customer", "المتجر": "Store", "المبلغ": "Amount",
  "سعد العتيبي": "Saad Al-Otaibi", "نورة القحطاني": "Noura Al-Qahtani", "فهد الدوسري": "Fahad Al-Dosari", "أم خالد": "Um Khaled", "محمد الشهري": "Mohammed Al-Shehri",
  "ذبائح الرياض": "Riyadh Slaughter", "أسواق الراعي": "Al Raai Markets", "10 نوفمبر 2026": "10 Nov 2026", "9 نوفمبر 2026": "9 Nov 2026", "عرض 1 إلى 5 من 128": "Showing 1 to 5 of 128",
}
const unmapped = new Set(); let mirrored = 0

// mirror a cloned frame for LTR
const flipA = a => (a === "MIN" ? "MAX" : a === "MAX" ? "MIN" : a)
async function toLTR(root) {
  let i
  while ((i = root.findOne(n => n.type === "INSTANCE"))) i.detachInstance()
  const all = root.findAll(() => true)
  for (const n of all) {
    if (n.type === "TEXT") {
      if (n.textAlignHorizontal === "RIGHT") n.textAlignHorizontal = "LEFT"; else if (n.textAlignHorizontal === "LEFT") n.textAlignHorizontal = "RIGHT"
      const t = EN[n.characters] || (n.characters.includes("ر.س") ? n.characters.replace("ر.س", "SAR") : null)
      if (t) n.characters = t; else if (/[؀-ۿ]/.test(n.characters)) unmapped.add(n.characters)
    }
  }
  for (const n of [root, ...all]) {
    if (n.type !== "FRAME" || n.layoutMode === "NONE") continue
    if (n.layoutMode === "HORIZONTAL" && n.getSharedPluginData(NS, "ltr") !== "1") { mirrored++
      n.children.slice().reverse().forEach(k => n.appendChild(k)); n.primaryAxisAlignItems = flipA(n.primaryAxisAlignItems)
      for (const k of n.children) if ("layoutPositioning" in k && k.layoutPositioning === "ABSOLUTE") k.x = n.width - k.width - k.x
    } else if (n.layoutMode === "VERTICAL") n.counterAxisAlignItems = flipA(n.counterAxisAlignItems)
  }
  // directional icons: caret-left <-> caret-right
  for (const n of root.findAll(x => x.name === "ph/caret-left" || x.name === "ph/caret-right")) {
    const flipName = n.name === "ph/caret-left" ? "caret-right" : "caret-left"
    const fills = n.findOne(v => v.type === "VECTOR").fills
    const fresh = await icon(flipName, n.width, "ink"); fresh.findAll(v => v.type === "VECTOR").forEach(v => (v.fills = fills))
    const p = n.parent, idx = p.children.indexOf(n); p.insertChild(idx, fresh); n.remove()
    if (p.layoutMode !== "NONE") { fresh.layoutSizingHorizontal = "FIXED" }
  }
  return root
}

const screen = (name, w) => frame(name, { w, fill: "bg", stroke: "line", r: "lg", clip: true })
const labelTag = async (t, d) => { const f = frame("tag", { dir: "HORIZONTAL", px: 12, py: 6, fill: d === "rtl" ? "ember" : "brand", r: "pill" }); add(f, await txt(t, "Label/M", "paper")); return f }
const dayCard = async (d, date, state) => {
  const sel = state === "selected", off = state === "off"
  const c = frame("day", { w: 108, pad: 12, gap: 4, fill: off ? "sand" : "paper", stroke: sel ? "ember" : "line", sw: sel ? 2 : 1, r: "md" })
  add(c, await txt(d, "Label/M", off ? "ink-2" : "ink", { w: 84 }), "h"); add(c, await txt(date, "Caption", "ink-2", { w: 84 }), "h")
  if (off) add(c, await txt("مكتمل", "Caption", "danger", { w: 84 }), "h")
  return c
}
const kv = async (k, v, strong) => {
  const r = frame("kv", { dir: "HORIZONTAL", main: "SPACE_BETWEEN", cross: "CENTER" })
  add(r, await txt(k, strong ? "Heading/H3" : "Body/M", strong ? "ink" : "ink-2")); add(r, await txt(v, strong ? "Heading/H3" : "Body/M", "ink", { align: "LEFT" })); return r
}
// build the Arabic screen, then its mirrored clone, side by side
async function pair(body, ar, en, build, notes, vertical) {
  const row = frame("pair", { dir: vertical ? "VERTICAL" : "HORIZONTAL", gap: vertical ? 40 : 120, ltr: true })
  const a = await build()
  const e = await toLTR(a.clone())
  const mk = async (tag, d, node) => { const col = frame("col", { gap: 12 }); add(col, await labelTag(tag, d)); col.appendChild(node); return col }
  row.appendChild(await mk("العربية · RTL (التصميم الأصلي)", "rtl", a)); row.appendChild(await mk("English · LTR (يُشتق بالعكس والترجمة)", "ltr", e))
  add(body, row)
  const nb = frame("notes", { dir: "HORIZONTAL", gap: 24, ltr: true })
  for (const [title, col, items] of notes) {
    const c = frame("note", { w: 540, pad: 16, gap: 8, fill: "paper", stroke: "line", r: "md" })
    add(c, await txt(title, "Heading/H3", col, { w: 508 }), "h")
    for (const it of items) { const r = frame("li", { dir: "HORIZONTAL", gap: 8 }); add(r, circle("b", 6, col === "success" ? "success" : "danger")); add(r, await txt(it, "Body/M", "ink-2", { w: 480 }), "h"); add(c, r, "h") }
    nb.appendChild(c)
  }
  add(body, nb)
  chk("ltr note title success", "success", "paper"); chk("ltr note title danger", "danger", "paper"); chk("ltr note body", "ink-2", "paper"); chk("ltr tag rtl", "paper", "ember"); chk("ltr tag ltr", "paper", "brand")
  return [a, e]
}
const MIRRORS = "ينعكس (يتبدّل الاتجاه)", STAYS = "لا ينعكس"

// ---- 1. Home -----------------------------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-ltr-home", "الرئيسية · Home", async body => {
  await pair(body, "الرئيسية", "Home", async () => {
    const s = screen("App/Home — RTL", 390)
    add(s, inst("app-header", { type: "home", cart: "filled" }), "h")
    const mid = frame("content", { px: 16, py: 8, gap: 16 })
    add(mid, inst("search-bar", { state: "default" }), "h"); add(mid, inst("section-header"), "h")
    const r = frame("cards", { dir: "HORIZONTAL", gap: 12 }); add(r, inst("product-card", { state: "default" })); add(r, inst("product-card", { state: "default" })); add(mid, r)
    add(s, mid, "h"); add(s, inst("bottom-tab-bar", { active: "1" }), "h")
    return s
  }, [[MIRRORS, "success", ["ترتيب عناصر الرأس: الشعار والموقع من اليمين إلى اليسار، والسلة والإشعارات في الطرف المقابل", "اتجاه سهم «الكل» وترتيب بطاقات المنتجات في الصف", "ترتيب تبويبات الشريط السفلي ومحاذاة النص"]], [STAYS, "danger", ["الشعار كأصل (نسخة لاتينية منفصلة)، وصور المنتجات", "الأرقام والأسعار (أرقام لاتينية في الاتجاهين) وعدّاد السلة", "اتجاه الأيقونات غير الموجّهة كالبحث والجرس والمتجر"]]])
}, 1200)

// ---- 2. Product ---------------------------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-ltr-product", "تفاصيل المنتج · Product", async body => {
  await pair(body, "تفاصيل المنتج", "Product", async () => {
    const s = screen("App/Product — RTL", 390)
    add(s, inst("app-header", { type: "page", cart: "filled" }), "h")
    const img = frame("image", { dir: "HORIZONTAL", w: 390, h: 200, main: "CENTER", cross: "CENTER", fill: "sand" }); add(img, await icon("image", 48, "ink-2")); add(s, img, "h")
    const info = frame("info", { px: 16, py: 16, gap: 12 })
    const v = frame("vendor", { dir: "HORIZONTAL", gap: 6, cross: "CENTER" }); add(v, await icon("storefront", 16, "ink-2")); add(v, await txt("مجازر الفلاح", "Label/M", "ink-2")); add(info, v)
    add(info, await txt("ريب آي بقري طازج", "Heading/H1", "ink", { w: 358 }), "h")
    const pr = frame("price", { dir: "HORIZONTAL", gap: 6, cross: "MAX" }); add(pr, await txt("89.00", "Display/L", "ink")); add(pr, await txt("ر.س", "Body/M", "ink-2")); add(info, pr)
    add(info, await txt("الحجم", "Label/M", "ink-2", { w: 358 }), "h")
    const ch = frame("sizes", { dir: "HORIZONTAL", gap: 8 })
    for (const [t, st] of [["500 جم", "selected"], ["1 كجم", "default"], ["2 كجم", "default"]]) { const c = inst("chip", { state: st }); setProp(c, "label", t); add(ch, c) }
    add(info, ch)
    const q = frame("qty", { dir: "HORIZONTAL", main: "SPACE_BETWEEN", cross: "CENTER" }); add(q, await txt("الكمية", "Label/M", "ink-2")); add(q, inst("stepper", { state: "default" })); add(info, q, "h")
    add(s, info, "h")
    const bar = frame("sticky", { dir: "HORIZONTAL", px: 16, py: 12, gap: 12, main: "SPACE_BETWEEN", cross: "CENTER", fill: "paper", stroke: "line" })
    const tot = frame("total", { gap: 0 }); add(tot, await txt("المجموع", "Caption", "ink-2")); add(tot, await txt("89.00 ر.س", "Heading/H2", "ink")); add(bar, tot)
    const b = inst("button", { variant: "primary", state: "default", size: "L" }); setProp(b, "label", "أضف إلى السلة"); add(bar, b)
    add(s, bar, "h")
    return s
  }, [[MIRRORS, "success", ["سهم الرجوع (يشير لليمين في RTL ولليسار في LTR) وموضع زر الرجوع", "ترتيب خيارات الحجم وموضع «+» في عدّاد الكمية (طرف البداية)", "موضع المجموع وزر الإضافة في الشريط الثابت"]], [STAYS, "danger", ["السعر والوزن بأرقام لاتينية، ورمز العملة يتبع اللغة فقط", "الصورة والمعرض", "ترتيب المجموع فوق الزر عموديًا"]]])
}, 1200)

// ---- 3. Checkout ----------------------------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-ltr-checkout", "الدفع · Checkout", async body => {
  await pair(body, "الدفع", "Checkout", async () => {
    const s = screen("App/Checkout — RTL", 390)
    const hdr = inst("app-header", { type: "page", cart: "empty" }); add(s, hdr, "h")
    const c = frame("content", { px: 16, py: 8, gap: 16 })
    add(c, await txt("طريقة الاستلام", "Label/M", "ink-2", { w: 358 }), "h")
    const m = frame("mode", { dir: "HORIZONTAL", gap: 8 }); const a = inst("chip", { state: "selected" }); setProp(a, "label", "توصيل"); const b = inst("chip", { state: "default" }); setProp(b, "label", "استلام من المتجر"); add(m, a); add(m, b); add(c, m)
    const adr = frame("address", { dir: "HORIZONTAL", pad: 16, gap: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
    add(adr, await icon("map-pin", 24, "ember", "fill")); const t = frame("t", { gap: 2 }); add(t, await txt("عنوان التوصيل", "Caption", "ink-2")); add(t, await txt("الملقا، الرياض", "Label/M", "ink")); add(adr, t)
    const sp = frame("sp", {}); add(adr, sp); sp.layoutSizingHorizontal = "FILL"; add(adr, await txt("تغيير", "Label/M", "ember")); add(c, adr, "h")
    add(c, await txt("يوم التوصيل", "Label/M", "ink-2", { w: 358 }), "h")
    const days = frame("days", { dir: "HORIZONTAL", gap: 8 }); add(days, await dayCard("الخميس", "12 نوفمبر", "selected")); add(days, await dayCard("الجمعة", "13 نوفمبر", "default")); add(days, await dayCard("السبت", "14 نوفمبر", "off")); add(c, days)
    const sum = frame("summary", { pad: 16, gap: 10, fill: "paper", stroke: "line", r: "md" })
    add(sum, await kv("المنتجات", "89.00 ر.س"), "h"); add(sum, await kv("التوصيل", "15.00 ر.س"), "h"); add(sum, await kv("ضريبة القيمة المضافة 15%", "13.56 ر.س"), "h"); add(sum, await kv("الإجمالي", "104.00 ر.س", true), "h"); add(c, sum, "h")
    const pay = inst("button", { variant: "primary", state: "default", size: "L" }); setProp(pay, "label", "ادفع الآن"); add(c, pay, "h")
    add(s, c, "h")
    return s
  }, [[MIRRORS, "success", ["ترتيب أيام التوصيل (الأقرب يبدأ من طرف البداية) وموضع «تغيير» في بطاقة العنوان", "موضع اسم البند مقابل قيمته في ملخص السعر", "أيقونة الموقع تبقى في طرف البداية"]], [STAYS, "danger", ["الأسعار بأرقام لاتينية ولا تُقلب", "تواريخ الأيام بالصيغة المحلية (الترجمة فقط)", "زر الدفع بعرض كامل"]]])
}, 1200)

// ---- 4. Admin table ------------------------------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-ltr-admin", "جدول الإدارة · Admin table", async body => {
  await pair(body, "جدول الإدارة", "Admin table", async () => {
    const s = frame("Admin/Orders — RTL", { w: 1180, pad: 24, gap: 16, fill: "bg", stroke: "line", r: "lg" })
    add(s, inst("page-header"), "h"); add(s, inst("filters-bar", { state: "active" }), "h"); add(s, inst("data-table", { state: "default" }), "h")
    return s
  }, [[MIRRORS, "success", ["ترتيب أعمدة الجدول: رقم الطلب أول عمود من طرف البداية ويصبح من اليسار", "محاذاة النص ورؤوس الأعمدة وأيقونات الفرز", "أزرار الترقيم (السابق على طرف البداية)، والقائمة الجانبية تنتقل إلى اليسار"]], [STAYS, "danger", ["أرقام الطلبات والمبالغ بأرقام لاتينية", "الرسوم البيانية واتجاه المحاور الزمنية (من الأقدم إلى الأحدث، يسارًا إلى اليمين دائمًا)", "الشارات والألوان ودلالات الحالة"]]], true)
}, 1300)

figma.viewport.scrollAndZoomIntoView(page(P).children)
print("✅ batch 5b done, mirrored rows: " + mirrored + "\n" + ctx.ids.join("\n") + "\nunmapped copy: " + (unmapped.size ? [...unmapped].join(" | ") : "none") + "\n" + contrastReport())
