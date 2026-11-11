const OWN = ["sec-opx-a-overview","sec-opx-a-orders"]
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
      else if (v && "ck" in v) { const x = inst("checkbox", { checked: v.ck ? "yes" : "no", state: "default" }); x.findAll(n => n.type === "TEXT").forEach(t => (t.visible = false)); add(k, x) }
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
// ---- Overview ----------------------------------------------------------------------------------------------
await screenSection(ctx, P, "sec-opx-a-overview", "نظرة عامة · Admin overview", async S => {
  S.note = "مؤشرات اليوم ومخططات الطلبات والمتاجر. القيم تجريبية بصيغة ر.س وأرقام لاتينية."
  await feature(S, "Overview", "لوحة المعلومات", "الإدارة / لوحة المعلومات", async b => {
    const k = row(24, { w: 1132 })
    for (const a of [["طلبات اليوم", "128", "12% عن أمس", true], ["إيراد اليوم", "48,350.00 ر.س", "8% عن أمس", true], ["متوسط قيمة الطلب", "377.73 ر.س", "3% عن أمس", true], ["التسليم في الوقت", "94%", "2% عن أمس", false]]) add(k, await kpi(...a), "h")
    add(b, k, "h")
    const r = row(24, { w: 1132, cross: "MIN" })
    const c1 = await card("الطلبات خلال آخر 7 أيام", { w: 700 })
    add(c1, await bars([86, 102, 94, 121, 133, 117, 128], ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"], 200), "h")
    add(c1, await txt("إجمالي الأسبوع: 781 طلبًا", "Body/M", "ink-2")); add(r, c1)
    const c2 = await card("حالات الطلبات اليوم", { w: 408 })
    for (const [l, p, v, key] of [["تم التسليم", 62, "79", "success"], ["قيد التجهيز", 22, "28", "brand"], ["في الطريق", 12, "15", "info"], ["ملغي", 4, "6", "danger"]]) add(c2, await bar1(l, p, v, key, 368), "h")
    add(r, c2); add(b, r, "h")
    const r2 = row(24, { w: 1132, cross: "MIN" })
    const c3 = await card("أعلى المتاجر مبيعًا هذا الأسبوع", { w: 554 })
    for (const [l, p, v] of [["مجازر الفلاح", 92, "18,420.00 ر.س"], ["ذبائح الرياض", 71, "14,150.00 ر.س"], ["أسواق الراعي", 48, "9,640.00 ر.س"]]) add(c3, await bar1(l, p, v, "brand", 514), "h")
    add(r2, c3)
    const c4 = await card("تحتاج انتباهك", { w: 554 })
    for (const [t, ty, l] of [["7 شكاوى مفتوحة", "danger", "عاجل"], ["3 شحنات متعثرة", "warning", "تأخير"], ["12 دفعة بائع بانتظار الاعتماد", "info", "مالية"]]) { const x = row(12, { w: 514, main: "SPACE_BETWEEN" }); add(x, await txt(t, "Body/M", "ink")); add(x, await bdg(ty, l)); add(c4, x, "h") }
    add(r2, c4); add(b, r2, "h")
  }, { acts: ["تصدير التقرير", "آخر 7 أيام"], h: 1180 })
})

// ---- Orders list + detail -----------------------------------------------------------------------------------
const COLS = [["", 44], ["رقم الطلب", 110], ["العميل", 200], ["المتجر", 190], ["الحالة", 130], ["الدفع", 130], ["المبلغ", 130], ["التاريخ", 150]]
const ORD = [["#10482", "سعد العتيبي", "مجازر الفلاح", "warning", "قيد التجهيز", "بطاقة مدى", "245.00 ر.س", "10 نوفمبر 2026"], ["#10481", "نورة القحطاني", "ذبائح الرياض", "success", "تم التسليم", "Apple Pay", "1,180.00 ر.س", "10 نوفمبر 2026"],
  ["#10480", "فهد الدوسري", "مجازر الفلاح", "info", "في الطريق", "عند الاستلام", "89.00 ر.س", "9 نوفمبر 2026"], ["#10479", "منيرة الشمري", "أسواق الراعي", "danger", "ملغي", "بطاقة مدى", "430.00 ر.س", "9 نوفمبر 2026"],
  ["#10478", "محمد الشهري", "ذبائح الرياض", "brand", "جديد", "Apple Pay", "312.50 ر.س", "9 نوفمبر 2026"], ["#10477", "ريم الحربي", "مجازر الفلاح", "success", "تم التسليم", "بطاقة ائتمان", "645.00 ر.س", "8 نوفمبر 2026"], ["#10476", "خالد المطيري", "أسواق الراعي", "warning", "قيد التجهيز", "عند الاستلام", "198.00 ر.س", "8 نوفمبر 2026"]]
const ordRows = (rs, sel = []) => rs.map(r => [{ ck: sel.includes(r[0]) }, { l: r[0] }, r[1], r[2], { b: [r[3], r[4]] }, r[5], r[6], r[7]])
const dlgPanel = async (b, d) => { const w = frame("dialog host", { dir: "HORIZONTAL", w: 1132, h: 560, main: "CENTER", cross: "CENTER", fill: "ink", alpha: 0.5, r: "md" }); add(w, d); add(b, w, "h") }
await screenSection(ctx, P, "sec-opx-a-orders", "الطلبات والتفاصيل · Admin orders", async S => {
  S.note = "قائمة الطلبات مع المرشحات والترقيم، وتفاصيل الطلب بخط زمني وإجراءات الإلغاء والاسترجاع وإعادة الجدولة وملصق A6."
  await feature(S, "Orders/List", "الطلبات", "الطلبات / كل الطلبات", async b => {
    add(b, filters(false), "h"); add(b, await table(COLS, ordRows(ORD), { pg: "عرض 1 إلى 7 من 128" }), "h")
  }, { acts: ["تصدير CSV", "تصدير"], empty: ["لا توجد طلبات مطابقة", "جرّب تغيير المرشحات أو نطاق التاريخ.", "مسح المرشحات"], h: 1000,
    filled: async b => { add(b, filters(true), "h"); add(b, await table(COLS, ordRows([ORD[0], ORD[6]], ["#10482"]), { pg: "عرض 1 إلى 2 من 2" }), "h") } })
  const detail = async b => {
    const r = row(24, { w: 1132, cross: "MIN" })
    const left = frame("main col", { w: 730, gap: 24 })
    const items = await card("المنتجات (3)", { w: 730 })
    add(items, await table([["", 64], ["المنتج", 330], ["الكمية", 90], ["السعر", 140]], [[{ ph: "ribeye-paper" }, "ريب آي بقري طازج 500 جم", "2", "178.00 ر.س"], [{ ph: "lamb-leg" }, "فخذ ضأن نعيمي", "1", "52.00 ر.س"], [{ ph: "strips" }, "ستربس بقري شرائح", "1", "15.00 ر.س"]], { w: 690, rh: 64 }), "h")
    add(left, items)
    const pay = await card("الدفع والتوصيل", { w: 730 }); await kv(pay, [["المجموع الفرعي", "245.00 ر.س"], ["رسوم التوصيل", "0.00 ر.س"], ["الإجمالي (شامل الضريبة)", "245.00 ر.س"], ["طريقة الدفع", "بطاقة مدى ••4821"], ["العميل", "سعد العتيبي · " + L("+966 55 123 4567")], ["المتجر", "مجازر الفلاح · الرياض"]], 690)
    const act = row(12); add(act, await btn("طباعة الملصق A6", "primary")); add(act, await btn("إعادة جدولة")); add(act, await btn("إلغاء واسترجاع", "danger")); add(pay, act)
    add(left, pay); add(r, left)
    const right = frame("side col", { w: 378, gap: 24 })
    const tl = await card("حالة الطلب", { w: 378 }); const t = inst("status-timeline", { stage: "3" }); add(tl, t); add(right, tl)
    const mp = await card("موقع التسليم", { w: 378 }); add(mp, await map(338, 160)); add(mp, await txt("حي الملقا، شارع أنس بن مالك، الرياض", "Body/M", "ink-2", { w: 338 }), "h"); add(right, mp)
    add(r, right); add(b, r, "h")
  }
  await feature(S, "Orders/Detail", "الطلب #10482", "الطلبات / #10482", detail, { acts: ["طباعة الملصق", "إلغاء واسترجاع"], h: 1240,
    extra: [
      ["Cancel and refund", async b => { const d = inst("dialog", { type: "destructive" }); await retext(d, "حذف العنوان؟", "إلغاء الطلب #10482؟"); await retext(d, "لن تتمكن من استرجاع هذا العنوان بعد الحذف.", "سيُسترجع مبلغ 245.00 ر.س إلى بطاقة مدى خلال 3 إلى 5 أيام عمل."); await retext(d, "حذف", "تأكيد الإلغاء"); await retext(d, "إلغاء", "تراجع"); await dlgPanel(b, d) }],
      ["Reschedule", async b => { const d = inst("dialog", { type: "default" }); await retext(d, "تأكيد الطلب؟", "إعادة جدولة التوصيل"); await retext(d, "سيتم إرسال طلبك إلى المتجر فور التأكيد.", "سيصل إشعار للعميل بالموعد الجديد: 11 نوفمبر 2026، من 4:00 م إلى 6:00 م."); await retext(d, "تأكيد", "حفظ الموعد"); await dlgPanel(b, d) }],
      ["A6 label", async b => { const c = await card("ملصق الطلب A6 (معاينة)", { w: 420 }); const w = frame("sheet", { dir: "HORIZONTAL", w: 1132, h: 520, main: "CENTER", cross: "CENTER", fill: "bg" })
        await kv(c, [["رقم الطلب", "#10482"], ["العميل", "سعد العتيبي"], ["المتجر", "مجازر الفلاح"], ["وقت الذبح", "10 نوفمبر 2026 · 9:30 ص"], ["الوزن", "1.5 كجم"]], 380)
        const code = row(2, { cross: "MAX" }); for (let i = 0; i < 28; i++) add(code, rect("code", i % 3 ? 3 : 6, 56, "ink")); add(c, code); add(w, c); add(b, w, "h") }]] })
})

print("✅ OPX-DES-1 admin part B (74-OPX-DES-1-admin-overview-orders) done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
