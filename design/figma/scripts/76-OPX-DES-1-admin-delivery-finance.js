const OWN = ["sec-opx-a-delivery","sec-opx-a-finance"]
// OPX-DES-1 part B (admin dashboard, page 30 Admin, 1440). Components only, Arabic RTL, SAR with Latin digits. Idempotent: screenSection rebuilds each section in place.
await loadDS()
const ctx = { y: 0 }, P = "30 Admin"
await page(P).loadAsync()
{ const rest = page(P).children.filter(n => !OWN.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }
const L = s => "⁦" + s + "⁩" // keep phone numbers and ids left-to-right inside Arabic text
const TXT = async (n, v) => { const t = n.findOne(x => x.type === "TEXT"); await figma.loadFontAsync(t.fontName); t.characters = v; return n }
const bdg = (type, label) => TXT(inst("badge", { type, size: "S" }), label)
const btn = (l, v = "secondary", st = "default") => button(l, v, st, "S")
const row = (gap = 16, o = {}) => frame(o.name || "row", { dir: "HORIZONTAL", gap, cross: o.cross || "CENTER", w: o.w, main: o.main })
async function kpi(label, value, delta, up = true) {
  const k = inst("kpi-card", { trend: up ? "up" : "down" })
  await retext(k, "طلبات اليوم", label); await retext(k, "128", value); await retext(k, up ? "12% عن أمس" : "5% عن أمس", delta); return k
}
async function card(title, o = {}) {
  const c = frame(o.name || "card", { w: o.w || 1132, pad: 20, gap: 16, fill: "paper", stroke: "line", r: "md" })
  if (title) add(c, await txt(title, "Heading/H3", "ink", { w: (o.w || 1132) - 40 }), "h")
  return c
}
async function kv(parent, pairs, w = 480) { // label / value lines
  for (const [k, v] of pairs) { const r = row(16, { w, main: "SPACE_BETWEEN" }); add(r, await txt(k, "Body/M", "ink-2")); add(r, await txt(v, "Body/M", "ink")); add(parent, r, "h") }
}
async function photo(key, w, h, name = "photo", r = "sm") {
  const f = frame(name, { w, h, fill: "sand", r, clip: true }); f.setSharedPluginData(NS, "photo", key); await setPhoto(f, key); return f
}
async function map(w, h) {
  const f = frame("map", { w, h, fill: "sand", r: "md", clip: true }); await setPhoto(f, "map")
  const p = inst("map-pin", { type: "address", state: "default" }); f.appendChild(p); p.layoutPositioning = "ABSOLUTE"; p.x = w / 2 - 20; p.y = h / 2 - 44; return f
}
async function bars(vals, labels, H = 180, key = "brand") { // simple bar chart from rects, values scaled to H
  const mx = Math.max(...vals), r = row(16, { name: "chart", cross: "MAX" })
  for (let i = 0; i < vals.length; i++) {
    const c = frame("bar", { w: 48, h: H + 28, main: "MAX", cross: "CENTER", gap: 8 })
    add(c, rect("bar", 32, Math.max(8, Math.round(vals[i] / mx * H)), i === vals.length - 1 ? "ember" : key, "sm")); add(c, await txt(labels[i], "Caption", "ink-2", { align: "CENTER", w: 48 })); add(r, c)
  }
  return r
}
async function bar1(label, pct, val, key = "brand", w = 480) { // horizontal share bar
  const c = frame("share", { w, gap: 8 }), t = row(8, { w, main: "SPACE_BETWEEN" })
  add(t, await txt(label, "Body/M", "ink")); add(t, await txt(val, "Body/M", "ink-2")); add(c, t, "h")
  const tr = frame("track", { w, h: 10, fill: "sand", r: "pill", dir: "HORIZONTAL", cross: "MIN" }); add(tr, rect("fill", Math.round(w * pct / 100), 10, key, "pill")); add(c, tr, "h"); return c
}
// Table: cols [[title, width]] (widths sum to 1084), rows of cells: string | {b:[type,label]} | {ph:key} | {i:icon} | {ck:true|false} | {l:"link text"}
async function table(cols, rows, o = {}) {
  const c = frame("table", { w: o.w || 1132, fill: "paper", stroke: "line", r: "md", clip: true })
  const hd = frame("header", { dir: "HORIZONTAL", px: 24, h: 48, cross: "CENTER", fill: "sand" })
  for (const [t, w] of cols) { const k = frame("cell", { dir: "HORIZONTAL", w, h: 48, px: 8, cross: "CENTER" }); if (t) add(k, await txt(t, "Label/M", "ink")); add(hd, k) }
  add(c, hd, "h")
  for (const R of rows) {
    const r = frame("row", { dir: "HORIZONTAL", px: 24, h: o.rh || 56, cross: "CENTER" })
    r.strokes = [paint("line")]; r.strokeTopWeight = 0; r.strokeBottomWeight = 1; r.strokeLeftWeight = 0; r.strokeRightWeight = 0
    for (let i = 0; i < cols.length; i++) {
      const v = R[i], k = frame("cell", { dir: "HORIZONTAL", w: cols[i][1], h: o.rh || 56, px: 8, gap: 8, cross: "CENTER" })
      if (v && v.b) add(k, await bdg(...v.b))
      else if (v && v.ph) add(k, await photo(v.ph, 40, 40, "thumb"))
      else if (v && v.i) add(k, await icon(v.i, 22, "ink-2"))
      else if (v && typeof v === "object" && "ck" in v) { const x = inst("checkbox", { checked: v.ck ? "yes" : "no", state: "default" }); x.findAll(n => n.type === "TEXT").forEach(t => (t.visible = false)); add(k, x) }
      else if (v != null && v !== "") add(k, await txt(v && v.l ? v.l : v, "Body/M", v && v.l ? "ember" : "ink", { w: cols[i][1] - 16 }))
      add(r, k)
    }
    add(c, r, "h")
  }
  if (o.pg) { const p = row(16, { w: 1132, main: "SPACE_BETWEEN" }); p.paddingLeft = p.paddingRight = 24; p.resize(1132, 56); p.counterAxisSizingMode = "FIXED"
    add(p, await txt(o.pg, "Body/M", "ink-2")); const pages = row(8)
    for (const t of ["1", "2", "3", "4"]) { const b = frame("page", { dir: "HORIZONTAL", w: 36, h: 36, main: "CENTER", cross: "CENTER", fill: t === "1" ? "ember" : null, stroke: t === "1" ? null : "line", r: "sm" }); add(b, await txt(t, "Label/M", t === "1" ? "paper" : "ink", { align: "CENTER" })); add(pages, b) }
    add(p, pages); add(c, p, "h") }
  return c
}
const filters = active => inst("filters-bar", { state: active ? "active" : "default" })
// state bodies
const DEF = { orders: ["لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب"], error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], denied: ["ليست لديك صلاحية", "تواصل مع مدير الحساب للحصول على الوصول.", "رجوع"] }
async function stBody(body, st, o) {
  if (st === "Loading") {
    const k = row(24, { w: 1132 }); for (let i = 0; i < 4; i++) { const s = frame("kpi skeleton", { w: 270, h: 104, pad: 20, gap: 12, fill: "paper", stroke: "line", r: "md" }); add(s, rect("sk", 120, 12, "sand", "pill")); add(s, rect("sk", 80, 28, "sand", "sm")); add(k, s) }
    add(body, k, "h")
    const t = frame("loading", { w: 1132, pad: 16, gap: 12, fill: "paper", stroke: "line", r: "md" }); for (let i = 0; i < 6; i++) add(t, inst("skeleton-row"), "h"); add(body, t, "h"); return
  }
  const kind = { Empty: "orders", Error: "error", Denied: "denied" }[st], d = DEF[kind].slice()
  if (st === "Empty" && o.empty) o.empty.forEach((v, i) => (d[i] = v))
  if (st === "Denied" && o.denied) d[1] = o.denied
  const p = inst("state-panel", { kind }); for (let i = 0; i < 3; i++) await retext(p, DEF[kind][i], d[i])
  const w = frame("state", { dir: "HORIZONTAL", w: 1132, h: 480, main: "CENTER", cross: "CENTER", fill: "paper", stroke: "line", r: "md" }); add(w, p); add(body, w, "h")
}
// One screen + its states. fill(body, state) builds Default (and Filled when o.filled). o: acts [primary, secondary], empty [t,b,cta], denied text, h, skip [], extra [[state, build]]
async function feature(S, path, title, crumb, fill, o = {}) {
  const base = await dashScreen({ path, title, crumb, state: "Default", h: o.h || 1100, actions: o.acts ? undefined : false })
  if (o.acts) { await retext(base.screen, "إضافة", o.acts[0]); await retext(base.screen, "تصدير", o.acts[1] || "تصدير") }
  await fill(base.body); S.main.push(base.screen)
  const more = [...(o.filled ? [["Filled", o.filled]] : []), ...(o.extra || [])]
  for (const [st, f] of more) { const c = stateCopy(base, st); await f(c.body); S.states.push(c.screen) }
  for (const st of ["Loading", "Empty", "Error", "Denied"]) { if ((o.skip || []).includes(st)) continue; const c = stateCopy(base, st); await stBody(c.body, st, o); S.states.push(c.screen) }
  return base
}
for (const [f, b] of [["ink", "paper"], ["ink-2", "paper"], ["ember", "paper"], ["ink", "sand"], ["ink-2", "bg"], ["paper", "ember"], ["ink", "bg"]]) chk("admin " + f + " on " + b, f, b)
const DEN = "عمليات التوصيل متاحة لدور مشرف التوصيل والإدارة فقط."
await screenSection(ctx, P, "sec-opx-a-delivery", "عمليات التوصيل · Admin delivery ops", async S => {
  S.note = "الشحنات الجارية، الإسناد اليدوي للسائقين، التوصيل الفاشل وتسويات الدفع عند الاستلام."
  await feature(S, "Delivery/Shipments", "الشحنات", "التوصيل / الشحنات", async b => {
    const k = row(24, { w: 1132 }); for (const a of [["شحنات جارية", "36", "4 عن أمس", true], ["سلّمت اليوم", "92", "9% عن أمس", true], ["متأخرة", "3", "1 عن أمس", false], ["سائقون متاحون", "14", "2 عن أمس", true]]) add(k, await kpi(...a), "h")
    add(b, k, "h"); add(b, await map(1132, 220), "h")
    add(b, await table([["الشحنة", 120], ["الطلب", 110], ["السائق", 170], ["من", 170], ["إلى", 170], ["الحالة", 130], ["الوصول المتوقع", 214]], [[{ l: "#S-7741" }, "#10480", "سلطان الغامدي", "مجازر الفلاح", "حي النرجس", { b: ["info", "في الطريق"] }, "اليوم 12:40 م"], [{ l: "#S-7740" }, "#10482", "ماجد الزهراني", "مجازر الفلاح", "حي الملقا", { b: ["warning", "بانتظار الاستلام"] }, "اليوم 1:15 م"], [{ l: "#S-7738" }, "#10476", "عمر السبيعي", "أسواق الراعي", "حي الياسمين", { b: ["danger", "متأخرة"] }, "اليوم 11:50 ص"]], { pg: "عرض 1 إلى 3 من 36" }), "h")
  }, { acts: ["إسناد يدوي", "تصدير"], denied: DEN, h: 1180 })
  await feature(S, "Delivery/Assign", "الإسناد اليدوي", "التوصيل / إسناد يدوي", async b => {
    const r = row(24, { w: 1132, cross: "MIN" }), c = await card("طلبات بانتظار الإسناد (3)", { w: 730 })
    add(c, await table([["", 44], ["الطلب", 110], ["المتجر", 190], ["الحي", 150], ["الجاهزية", 140]], [[{ ck: true }, { l: "#10484" }, "ذبائح الرياض", "حي العليا", "بعد 10 دقائق"], [{ ck: false }, { l: "#10483" }, "مجازر الفلاح", "حي الملقا", "بعد 25 دقيقة"], [{ ck: false }, { l: "#10481" }, "أسواق الراعي", "حي الربوة", "جاهز"]], { w: 690 }), "h")
    add(r, c); const d = await card("السائقون القريبون", { w: 378 }); add(d, await map(338, 150))
    for (const [n, t, l] of [["سلطان الغامدي", "success", "متاح · 1.2 كم"], ["ماجد الزهراني", "success", "متاح · 2.8 كم"], ["عمر السبيعي", "warning", "مشغول"]]) { const x = row(8, { w: 338, main: "SPACE_BETWEEN" }); add(x, await txt(n, "Body/M", "ink")); add(x, await bdg(t, l)); add(d, x, "h") }
    add(d, await btn("إسناد إلى سلطان الغامدي", "primary")); add(r, d); add(b, r, "h")
  }, { acts: ["إسناد تلقائي", "تصدير"], denied: DEN, h: 940, empty: ["لا توجد طلبات بانتظار الإسناد", "كل الطلبات الجاهزة لديها سائق.", "عرض الشحنات"] })
  await feature(S, "Delivery/Failed", "التوصيل الفاشل", "التوصيل / فاشلة", async b => {
    add(b, await table([["الشحنة", 120], ["العميل", 200], ["السبب", 290], ["المحاولات", 110], ["الإجراء", 364]], [[{ l: "#S-7702" }, "نورة القحطاني", "العميل لم يردّ على الاتصال", "2 من 3", { l: "إعادة المحاولة غدًا" }], [{ l: "#S-7695" }, "فهد الدوسري", "العنوان غير دقيق", "1 من 3", { l: "التواصل مع العميل" }], [{ l: "#S-7688" }, "خالد المطيري", "رفض الاستلام", "3 من 3", { l: "استرجاع المبلغ" }]], { pg: "عرض 1 إلى 3 من 3" }), "h")
  }, { acts: ["إعادة جدولة الكل", "تصدير"], denied: DEN, h: 760, empty: ["لا توجد محاولات فاشلة", "جميع الشحنات سُلّمت بنجاح اليوم.", "عرض الشحنات"] })
  await feature(S, "Delivery/COD", "تسويات الدفع عند الاستلام", "التوصيل / تسويات COD", async b => {
    const k = row(24, { w: 1132 }); for (const a of [["نقد محصّل اليوم", "12,480.00 ر.س", "6% عن أمس", true], ["بانتظار التسوية", "4,215.00 ر.س", "2% عن أمس", false], ["فروقات", "0.00 ر.س", "ثابت", true]]) add(k, await kpi(...a), "h")
    add(b, k, "h")
    add(b, await table([["السائق", 220], ["المحصّل", 170], ["المتوقع", 170], ["الفرق", 120], ["الحالة", 150], ["التاريخ", 254]], [["سلطان الغامدي", "2,340.00 ر.س", "2,340.00 ر.س", "0.00 ر.س", { b: ["success", "تمت التسوية"] }, "10 نوفمبر 2026"], ["ماجد الزهراني", "1,875.00 ر.س", "1,900.00 ر.س", "25.00 ر.س", { b: ["warning", "فرق للمراجعة"] }, "10 نوفمبر 2026"], ["عمر السبيعي", "1,140.00 ر.س", "1,140.00 ر.س", "0.00 ر.س", { b: ["info", "بانتظار التسليم"] }, "10 نوفمبر 2026"]], { pg: "عرض 1 إلى 3 من 14" }), "h")
  }, { acts: ["اعتماد التسويات", "تصدير"], denied: DEN, h: 900, empty: ["لا توجد تسويات", "ستظهر تسويات الدفع عند الاستلام هنا.", "عرض الشحنات"] })
})

// ---- Finance -------------------------------------------------------------------------------------------------
const FDEN = "الصفحات المالية متاحة لدور المالية والإدارة العليا فقط."
await screenSection(ctx, P, "sec-opx-a-finance", "المالية · Admin finance", async S => {
  S.note = "أرصدة البائعين، دفعات التحويل، والتقارير المالية القابلة للتصدير."
  await feature(S, "Finance/Balances", "الأرصدة", "المالية / الأرصدة", async b => {
    const k = row(24, { w: 1132 }); for (const a of [["إجمالي المبيعات (نوفمبر)", "212,640.00 ر.س", "9% عن أكتوبر", true], ["عمولة المنصة", "21,264.00 ر.س", "9% عن أكتوبر", true], ["مستحقات البائعين", "168,310.00 ر.س", "4% عن أكتوبر", true], ["مبالغ معلّقة", "8,420.00 ر.س", "2% عن أكتوبر", false]]) add(k, await kpi(...a), "h")
    add(b, k, "h")
    add(b, await table([["البائع", 260], ["المبيعات", 180], ["العمولة", 160], ["الرصيد المستحق", 190], ["الحالة", 294]], [["مجازر الفلاح", "74,320.00 ر.س", "7,432.00 ر.س", "52,880.00 ر.س", { b: ["success", "جاهز للدفع"] }], ["ذبائح الرياض", "61,150.00 ر.س", "6,115.00 ر.س", "44,210.00 ر.س", { b: ["success", "جاهز للدفع"] }], ["أسواق الراعي", "38,970.00 ر.س", "3,897.00 ر.س", "27,640.00 ر.س", { b: ["warning", "بانتظار المستندات"] }]], { pg: "عرض 1 إلى 3 من 18" }), "h")
  }, { acts: ["تصدير الأرصدة", "تصدير"], denied: FDEN, h: 1000 })
  await feature(S, "Finance/Payouts", "الدفعات", "المالية / الدفعات", async b => {
    add(b, await table([["رقم الدفعة", 130], ["البائع", 220], ["الآيبان", 250], ["المبلغ", 170], ["الحالة", 150], ["التاريخ", 164]], [[{ l: "#P-0412" }, "مجازر الفلاح", L("SA03 8000 0000 6080 1016 7519"), "52,880.00 ر.س", { b: ["info", "قيد التحويل"] }, "11 نوفمبر 2026"], [{ l: "#P-0411" }, "ذبائح الرياض", L("SA44 2000 0001 2345 6789 1234"), "44,210.00 ر.س", { b: ["warning", "بانتظار الاعتماد"] }, "11 نوفمبر 2026"], [{ l: "#P-0403" }, "أسواق الراعي", L("SA15 1000 0004 5600 1122 3344"), "26,300.00 ر.س", { b: ["success", "تم التحويل"] }, "4 نوفمبر 2026"]], { pg: "عرض 1 إلى 3 من 52" }), "h")
  }, { acts: ["اعتماد الدفعات المحددة", "تصدير"], denied: FDEN, h: 820, empty: ["لا توجد دفعات", "ستظهر دفعات البائعين هنا بعد أول دورة تسوية.", "عرض الأرصدة"] })
  await feature(S, "Finance/Reports", "التقارير المالية", "المالية / التقارير", async b => {
    const r = row(24, { w: 1132, cross: "MIN" }), c = await card("المبيعات الأسبوعية (ألف ر.س)", { w: 700 })
    add(c, await bars([41, 48, 45, 52, 58, 49, 55], ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"], 200), "h"); add(r, c)
    const e = await card("تصدير تقرير", { w: 408 }); add(e, await field("الفترة", "1 إلى 10 نوفمبر 2026", "filled"), "h")
    for (const l of ["تقرير المبيعات", "تقرير العمولات", "تقرير ضريبة القيمة المضافة"]) add(e, await btn(l + " (CSV)")); add(r, e); add(b, r, "h")
  }, { acts: ["جدولة التقرير", "تصدير"], denied: FDEN, h: 800 })
})

print("✅ OPX-DES-1 admin part B (76-OPX-DES-1-admin-delivery-finance) done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
