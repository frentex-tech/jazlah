const OWN = ["sec-opx-a-customers","sec-opx-a-complaints"]
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
// ---- Customers -----------------------------------------------------------------------------------------------
const CC = [["العميل", 230], ["الجوال", 170], ["المدينة", 120], ["الطلبات", 100], ["إجمالي الإنفاق", 170], ["آخر طلب", 160], ["الحالة", 134]]
const CUS = [["سعد العتيبي", "+966 55 123 4567", "الرياض", "24", "6,820.00 ر.س", "10 نوفمبر 2026", "success", "نشط"], ["نورة القحطاني", "+966 50 442 1180", "جدة", "17", "4,310.50 ر.س", "10 نوفمبر 2026", "success", "نشط"],
  ["فهد الدوسري", "+966 54 780 3392", "الدمام", "9", "1,245.00 ر.س", "9 نوفمبر 2026", "success", "نشط"], ["منيرة الشمري", "+966 56 218 9045", "الرياض", "3", "860.00 ر.س", "9 نوفمبر 2026", "warning", "شكوى مفتوحة"],
  ["محمد الشهري", "+966 59 306 7721", "أبها", "31", "9,975.75 ر.س", "8 نوفمبر 2026", "success", "نشط"], ["ريم الحربي", "+966 53 611 2084", "المدينة المنورة", "6", "1,720.00 ر.س", "5 نوفمبر 2026", "neutral", "غير نشط"], ["خالد المطيري", "+966 55 904 1376", "الرياض", "2", "396.00 ر.س", "2 نوفمبر 2026", "danger", "معلّق"]]
await screenSection(ctx, P, "sec-opx-a-customers", "العملاء · Admin customers", async S => {
  S.note = "قائمة العملاء مع البحث والمرشحات، وملف العميل بطلباته وعناوينه وإجراءات الحساب."
  await feature(S, "Customers/List", "العملاء", "العملاء / كل العملاء", async b => {
    add(b, filters(false), "h"); add(b, await table(CC, CUS.map(c => [c[0], L(c[1]), c[2], c[3], c[4], c[5], { b: [c[6], c[7]] }]), { pg: "عرض 1 إلى 7 من 2,418" }), "h")
  }, { acts: ["إضافة عميل", "تصدير"], empty: ["لا يوجد عملاء مطابقون", "جرّب البحث برقم الجوال أو الاسم الكامل.", "مسح المرشحات"], h: 1000,
    filled: async b => { add(b, filters(true), "h"); add(b, await table(CC, [CUS[3]].map(c => [c[0], L(c[1]), c[2], c[3], c[4], c[5], { b: [c[6], c[7]] }]), { pg: "عرض 1 إلى 1 من 1" }), "h") } })
  await feature(S, "Customers/Detail", "سعد العتيبي", "العملاء / سعد العتيبي", async b => {
    const k = row(24, { w: 1132 }); for (const a of [["إجمالي الطلبات", "24", "3 هذا الشهر", true], ["إجمالي الإنفاق", "6,820.00 ر.س", "11% عن الشهر الماضي", true], ["متوسط الطلب", "284.17 ر.س", "2% عن الشهر الماضي", false]]) add(k, await kpi(...a), "h")
    add(b, k, "h")
    const r = row(24, { w: 1132, cross: "MIN" })
    const left = frame("col", { w: 730, gap: 24 }), t = await card("آخر الطلبات", { w: 730 })
    add(t, await table([["رقم الطلب", 130], ["المتجر", 190], ["الحالة", 130], ["المبلغ", 140]], [[{ l: "#10482" }, "مجازر الفلاح", { b: ["warning", "قيد التجهيز"] }, "245.00 ر.س"], [{ l: "#10455" }, "ذبائح الرياض", { b: ["success", "تم التسليم"] }, "560.00 ر.س"], [{ l: "#10391" }, "مجازر الفلاح", { b: ["success", "تم التسليم"] }, "132.00 ر.س"]], { w: 690 }), "h")
    add(left, t); add(r, left)
    const right = frame("col", { w: 378, gap: 24 }), pf = await card("بيانات العميل", { w: 378 })
    await kv(pf, [["الجوال", L("+966 55 123 4567")], ["المدينة", "الرياض"], ["تاريخ الانضمام", "14 مارس 2026"], ["الحالة", "نشط"]], 338)
    const a = row(12); add(a, await btn("تعليق الحساب", "danger")); add(a, await btn("إرسال إشعار")); add(pf, a); add(right, pf)
    const ad = await card("العنوان الافتراضي", { w: 378 }); add(ad, await map(338, 150)); add(ad, await txt("حي الملقا، شارع أنس بن مالك، الرياض 13521", "Body/M", "ink-2", { w: 338 }), "h"); add(right, ad)
    add(r, right); add(b, r, "h")
  }, { acts: ["إرسال إشعار", "تعليق الحساب"], h: 1080 })
})

// ---- Complaints ----------------------------------------------------------------------------------------------
const QC = [["رقم الشكوى", 120], ["العميل", 190], ["الطلب", 110], ["السبب", 230], ["الأولوية", 120], ["الحالة", 130], ["منذ", 184]]
const QR = [["#C-3021", "منيرة الشمري", "#10479", "لحم غير طازج عند الاستلام", "danger", "عاجلة", "warning", "قيد المراجعة", "ساعتان"], ["#C-3019", "سعد العتيبي", "#10455", "تأخر التوصيل أكثر من ساعة", "warning", "عالية", "info", "جديدة", "5 ساعات"],
  ["#C-3017", "ريم الحربي", "#10477", "نقص في الكمية المطلوبة", "info", "متوسطة", "warning", "قيد المراجعة", "يوم واحد"], ["#C-3012", "خالد المطيري", "#10476", "تغليف تالف", "neutral", "منخفضة", "success", "تم الحل", "3 أيام"], ["#C-3009", "فهد الدوسري", "#10480", "طلب استرجاع المبلغ", "info", "متوسطة", "success", "تم الحل", "4 أيام"]]
const qRows = rs => rs.map(r => [{ l: r[0] }, r[1], r[2], r[3], { b: [r[4], r[5]] }, { b: [r[6], r[7]] }, r[8]])
await screenSection(ctx, P, "sec-opx-a-complaints", "الشكاوى · Admin complaints", async S => {
  S.note = "طابور الشكاوى حسب الأولوية، وتفصيل الشكوى بصور العميل والرد والاسترجاع."
  await feature(S, "Complaints/Queue", "الشكاوى", "الشكاوى / الطابور", async b => {
    add(b, filters(false), "h"); add(b, await table(QC, qRows(QR), { pg: "عرض 1 إلى 5 من 23" }), "h")
  }, { acts: ["تعيين لموظف", "تصدير"], empty: ["لا توجد شكاوى مفتوحة", "كل الشكاوى تمت معالجتها. أحسنتم.", "عرض الشكاوى المغلقة"], h: 900,
    filled: async b => { add(b, filters(true), "h"); add(b, await table(QC, qRows([QR[0]]), { pg: "عرض 1 إلى 1 من 1" }), "h") } })
  const detail = res => async b => {
    const r = row(24, { w: 1132, cross: "MIN" }), left = frame("col", { w: 730, gap: 24 })
    const c = await card("الشكوى #C-3021", { w: 730 }); const hd = row(8); add(hd, await bdg("danger", "عاجلة")); add(hd, await bdg(res ? "success" : "warning", res ? "تم الحل" : "قيد المراجعة")); add(c, hd)
    add(c, await txt("وصلني اللحم بلون داكن ورائحة غير طبيعية، وقد تم إغلاق الطلب قبل موعد الذبح المحدد. أرفقت صورًا للمنتج عند الاستلام.", "Body/L", "ink", { w: 690 }), "h")
    const ph = row(12); for (const k of ["lamb-raw", "carcass", "strips"]) add(ph, await photo(k, 216, 150, "photo", "md")); add(c, ph); add(left, c)
    const rp = await card(res ? "تم الحل: استرجاع 430.00 ر.س" : "الرد على العميل", { w: 730 })
    if (res) add(rp, await txt("تم استرجاع المبلغ إلى بطاقة مدى وإرسال إشعار للعميل. أُغلقت الشكوى بواسطة ليلى الغامدي في 10 نوفمبر 2026.", "Body/M", "ink-2", { w: 690 }), "h")
    else { add(rp, await field("نص الرد", "نعتذر عن ذلك. سنسترجع المبلغ كاملًا خلال 3 أيام عمل.", "filled"), "h"); const a = row(12); add(a, await btn("استرجاع 430.00 ر.س", "primary")); add(a, await btn("إرسال الرد")); add(a, await btn("تصعيد", "ghost")); add(rp, a) }
    add(left, rp); add(r, left)
    const right = await card("بيانات الطلب", { w: 378 }); await kv(right, [["العميل", "منيرة الشمري"], ["الطلب", "#10479"], ["المتجر", "أسواق الراعي"], ["المبلغ", "430.00 ر.س"], ["تاريخ الشكوى", "10 نوفمبر 2026"], ["المسؤول", "ليلى الغامدي"]], 338)
    add(r, right); add(b, r, "h")
  }
  await feature(S, "Complaints/Detail", "الشكوى #C-3021", "الشكاوى / #C-3021", detail(false), { acts: ["استرجاع المبلغ", "تصعيد"], h: 1020, extra: [["Resolved", detail(true)]] })
})

print("✅ OPX-DES-1 admin part B (75-OPX-DES-1-admin-customers-complaints) done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
