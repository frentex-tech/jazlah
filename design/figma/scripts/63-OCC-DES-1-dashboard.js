// OCC-DES-1 (4/4): dashboards. Admin (30): occasion review and pricing, kitchens, Adha settings, Adha per-day board. Vendor (31): visits calendar, animal registration. Kitchen (32): kitchen board.
await loadDS()
const ctx = { y: 0 }, W = 358
const yOf = async (pg, own) => { await page(pg).loadAsync(); const r = page(pg).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id"))); return r.length ? Math.max(...r.map(n => n.y + n.height)) + 200 : 0 }
const T = (s, st = "Body/M", c = "ink", w, a) => txt(s, st, c, { w, align: a })
const ICON = { warning: "warning", danger: "warning-circle", info: "info", success: "check-circle" }
async function note(w, kind, title, body) {
  const f = frame("banner " + kind, { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, fill: ({ success: "sand", info: "sand" }[kind] || kind + "-bg"), r: "md" })
  add(f, await icon(ICON[kind], 24, kind, "fill"))
  const c = frame("copy", { gap: 4, w: w - 52 }); add(c, await T(title, "Label/M", "ink", w - 52), "h"); if (body) add(c, await T(body, "Body/M", "ink-2", w - 52), "h")
  add(f, c); chk("banner ink " + kind, "ink", ({ success: "sand", info: "sand" }[kind] || kind + "-bg")); chk("banner sub " + kind, "ink-2", ({ success: "sand", info: "sand" }[kind] || kind + "-bg")); chk("banner icon " + kind, kind, ({ success: "sand", info: "sand" }[kind] || kind + "-bg"), 3); return f
}
async function box(w, fn, o = {}) {
  const p = o.pad == null ? 16 : o.pad, bg = o.fill || "paper"
  const f = frame(o.name || "card", { w, pad: p, gap: o.gap || 12, fill: bg, stroke: o.stroke === undefined ? "line" : o.stroke, sw: o.sw, r: "md", clip: o.clip })
  await fn(f, w - 2 * p); chk("card ink " + bg, "ink", bg); chk("card sub " + bg, "ink-2", bg); return f
}
async function kv(w, k, v, bold) {
  const r = frame("row", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(r, await T(k, bold ? "Label/M" : "Body/M", bold ? "ink" : "ink-2")); add(r, await T(v, bold ? "Heading/H3" : "Body/M", "ink")); return r
}
async function pill(label, kind) { const f = frame("pill " + kind, { dir: "HORIZONTAL", px: 12, py: 4, fill: ({ success: "sand", info: "sand" }[kind] || kind + "-bg"), r: "pill" }); add(f, await T(label, "Label/M", ({ success: "ink", info: "ink" }[kind] || kind))); chk("pill " + kind, ({ success: "ink", info: "ink" }[kind] || kind), ({ success: "sand", info: "sand" }[kind] || kind + "-bg")); return f }
async function photo(w, h, key, name = "photo", r = "md") { const f = frame(name, { dir: "HORIZONTAL", w, h, main: "CENTER", cross: "CENTER", fill: "sand", r, clip: true }); add(f, await icon("image", 32, "ink-2")); f.setSharedPluginData(NS, "photo", key); return f }
async function map(w, h, r = "md") { const f = frame("map", { dir: "HORIZONTAL", w, h, main: "CENTER", cross: "CENTER", fill: "sand", r, clip: true }); add(f, await icon("map-pin", 36, "ember", "fill")); return f }
async function steps(w, i, n, label) {
  const f = frame("step indicator", { w, gap: 8 }); add(f, await T(`الخطوة ${i} من ${n}: ${label}`, "Label/M", "ink-2", w), "h")
  const bars = frame("bars", { dir: "HORIZONTAL", gap: 8 }), bw = Math.floor((w - 8 * (n - 1)) / n)
  for (let k = 0; k < n; k++) add(bars, rect("step " + (k + 1), bw, 4, k < i ? "ember" : "line", "pill"))
  add(f, bars); chk("step label", "ink-2", "bg"); return f
}
async function opt(w, ic, title, sub, sel, off) {
  const f = frame("option", { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, cross: "CENTER", fill: off ? "sand" : "paper", stroke: sel ? "ember" : "line", sw: sel ? 2 : 1, r: "md" }); f.minHeight = 56
  add(f, await icon(sel ? "check-circle" : ic, 24, sel ? "ember" : "ink-2", sel ? "fill" : "regular"))
  const c = frame("copy", { gap: 2, w: w - 32 - 36 }); add(c, await T(title, "Label/M", off ? "ink-2" : "ink", w - 68), "h"); if (sub) add(c, await T(sub, "Body/M", "ink-2", w - 68), "h")
  add(f, c); chk("opt sub sand", "ink-2", "sand"); return f
}
async function cta(b, label, state = "default", second) {
  const sp = spacer(); add(b, sp); sp.layoutSizingVertical = "FILL"
  add(b, await button(label, "primary", state), "h"); if (second) add(b, await button(second, "secondary"), "h")
}
async function empty(b, [ic, title, body, label]) {
  const p = inst("state-panel", { kind: "orders" })
  await retext(p, "لا توجد طلبات بعد", title); await retext(p, "طلباتك السابقة والحالية ستظهر هنا.", body); await retext(p, "ابدأ أول طلب", label)
  add(b, await slot(p, "icon", async s => add(s, await icon(ic, 40, "ink-2"))), "h")
}
// one mobile screen family: Default + states. o: path, title, tab, pre(b), cta, empty[ic,title,body,label], err[title,body], states[]
async function family(o, content) {
  const out = { main: null, states: [] }
  for (const st of ["Default", ...(o.states || [])]) {
    const { screen, body: b } = await mobileScreen({ path: o.path, state: st, header: o.header || { type: "page", title: o.title }, tab: o.tab, gap: 12 })
    if (o.pre) await o.pre(b)
    if (st === "Loading") { add(b, await skeletonRows(3), "h"); await cta(b, o.cta || "متابعة", "disabled") }
    else if (st === "Empty") await empty(b, o.empty)
    else if (st === "Error") { add(b, await note(W, "danger", o.err[0], o.err[1]), "h"); await cta(b, "إعادة المحاولة") }
    else await content(b, st)
    if (st === "Default") out.main = screen; else out.states.push(screen)
  }
  return out
}
// web family (1200 body): H1 + content(b, st). o: path, title, active, states[], err[], empty[]
async function wfamily(o, content) {
  const out = { main: null, states: [] }
  for (const st of ["Default", ...(o.states || [])]) {
    const { screen, body: b } = await webScreen({ path: o.path, state: st, active: o.active })
    add(b, await T(o.title, "Heading/H1", "ink", 1200), "h")
    if (st === "Loading") { const r = frame("loading", { dir: "HORIZONTAL", w: 1200, gap: 40, cross: "MIN" }), l = frame("rows", { w: 760, gap: 16 }); for (let i = 0; i < 4; i++) add(l, inst("skeleton-row"), "h"); add(r, l); add(r, rect("summary skeleton", 400, 300, "sand", "md")); add(b, r, "h") }
    else if (st === "Empty") await empty(b, o.empty)
    else if (st === "Error") { add(b, await note(1200, "danger", o.err[0], o.err[1]), "h"); add(b, await button("إعادة المحاولة", "secondary")) }
    else await content(b, st)
    if (st === "Default") out.main = screen; else out.states.push(screen)
  }
  return out
}
async function two(b, mainFn, sideFn) {
  const r = frame("columns", { dir: "HORIZONTAL", w: 1200, gap: 40, cross: "MIN" }), m = frame("main", { w: 760, gap: 16 }), s = frame("side", { w: 400, gap: 16 })
  await mainFn(m, 760); await sideFn(s, 400); add(r, m); add(r, s); add(b, r, "h")
}
const sec = (pg, id, title, fams, noteTxt) => screenSection(ctx, pg, id, title, async S => { for (const f of fams) { S.main.push(f.main); S.states.push(...f.states) } if (noteTxt) S.note = noteTxt })
const DOW = ["الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
async function strip(sel, kinds = ["avail", "full", "avail", "avail", "closed"], nums = [18, 19, 20, 21, 22]) {
  const row = frame("day strip", { dir: "HORIZONTAL", gap: 8 })
  for (let i = 0; i < 5; i++) {
    const k = nums[i] === sel ? "sel" : kinds[i], K = { sel: ["ember", "paper", null], avail: ["paper", "ink", "line"], full: ["sand", "ink-2", null], closed: ["sand", "ink-2", null] }[k]
    const c = frame("day " + nums[i], { w: 64, h: 76, main: "CENTER", cross: "CENTER", fill: K[0], stroke: K[2], r: "md" })
    add(c, await txt(DOW[i], "Caption", K[1], { align: "CENTER", w: 56 })); add(c, await txt(String(nums[i]), "Heading/H3", K[1], { align: "CENTER", w: 56 }))
    if (k === "full") add(c, await icon("users-three", 14, K[1])); if (k === "closed") add(c, await icon("lock-simple", 14, K[1]))
    chk("day " + k, K[1], K[0]); add(row, c)
  }
  return row
}
const OWN = { "30 Admin": ["sec-occ-admin-occasions", "sec-occ-admin-pricing", "sec-occ-admin-kitchens", "sec-occ-admin-adha-settings", "sec-occ-admin-adha-board"], "31 Vendor": ["sec-occ-vendor-visits", "sec-occ-vendor-animal"], "32 Kitchen": ["sec-occ-kitchen-board"] }
// dashboard family: Default + states. o: path, role, title, crumb, add, exp (header button labels), states, empty[ic,title,body,label]
async function dfamily(o, content) {
  const out = { main: null, states: [] }
  for (const st of ["Default", ...(o.states || [])]) {
    const { screen, body: b } = await dashScreen({ path: o.path, role: o.role, title: o.title, crumb: o.crumb, state: st })
    await retext(screen, "إضافة", o.add); await retext(screen, "تصدير", o.exp)
    if (st === "Loading") for (let i = 0; i < 5; i++) add(b, rect("skeleton row", 1132, 56, "sand", "md"), "h")
    else if (st === "Empty") await empty(b, o.empty)
    else if (st === "Error" || st === "Denied") { const w = frame("panel", { dir: "HORIZONTAL", w: 1132, h: 360, main: "CENTER", cross: "CENTER", fill: "paper", stroke: "line", r: "md" }); add(w, inst("state-panel", { kind: st === "Error" ? "error" : "denied" })); add(b, w, "h") }
    else await content(b, st)
    if (st === "Default") out.main = screen; else out.states.push(screen)
  }
  return out
}
async function table(b, cols, rows, name = "table") {
  const c = frame(name, { w: 1132, fill: "paper", stroke: "line", r: "md", clip: true }), cell = (w, h = 56) => frame("cell", { dir: "HORIZONTAL", w, h, cross: "CENTER", px: 8 })
  const hd = frame("header", { dir: "HORIZONTAL", px: 24, h: 48, cross: "CENTER", fill: "sand" })
  for (const [t, w] of cols) { const k = cell(w, 48); add(k, await T(t, "Label/M", "ink")); add(hd, k) }
  add(c, hd, "h"); chk("table header", "ink", "sand"); chk("table text", "ink", "paper"); chk("table id", "ember", "paper")
  for (const R of rows) {
    const row = frame("row", { dir: "HORIZONTAL", px: 24, h: 56, cross: "CENTER" }); row.strokes = [paint("line")]; row.strokeTopWeight = row.strokeLeftWeight = row.strokeRightWeight = 0; row.strokeBottomWeight = 1
    for (const [i, v] of R.entries()) { const k = cell(cols[i][1]); add(k, Array.isArray(v) ? await pill(v[0], v[1]) : await T(v, "Body/M", i === 0 ? "ember" : "ink")); add(row, k) }
    add(c, row, "h")
  }
  add(b, c, "h")
}
async function dcols(b, mfn, sfn, mw = 720, sw = 388) {
  const r = frame("columns", { dir: "HORIZONTAL", w: 1132, gap: 24, cross: "MIN" }), m = frame("main", { w: mw, gap: 16 }), s = frame("side", { w: sw, gap: 16 })
  await mfn(m, mw); await sfn(s, sw); add(r, m); add(r, s); add(b, r, "h")
}
async function fsec(b, title, desc, fn) {
  const c = frame("form-section", { dir: "HORIZONTAL", w: 1132, pad: 24, gap: 32, fill: "paper", stroke: "line", r: "md" }), i = frame("info", { w: 280, gap: 8 })
  add(i, await T(title, "Heading/H2", "ink", 280), "h"); add(i, await T(desc, "Body/M", "ink-2", 280), "h"); add(c, i)
  const f = frame("fields", { gap: 16 }); await fn(f); add(c, f); add(b, c, "h"); chk("form copy", "ink-2", "paper")
}
async function pair(f, a, b2) { const r = frame("pair", { dir: "HORIZONTAL", gap: 24 }); add(r, a); add(r, b2); add(f, r) }
async function actions(b, save, dis) { const r = frame("form-actions", { dir: "HORIZONTAL", w: 1132, px: 24, py: 16, gap: 12, fill: "paper", stroke: "line", r: "md" }); add(r, await button(save, "primary", dis ? "disabled" : "default")); add(r, await button("إلغاء", "secondary")); add(b, r, "h") }
// ---- admin: occasion requests list ----------------------------------------------------------------------
const A = "30 Admin", V = "31 Vendor", K = "32 Kitchen"
const d1 = await dfamily({ path: "Occasions/List", role: "admin", title: "طلبات المناسبات", crumb: "المناسبات / كل الطلبات", add: "طلب جديد", exp: "تصدير", states: ["Loading", "Empty", "Error", "Denied"],
  empty: ["calendar-x", "لا توجد طلبات مناسبات", "ستظهر هنا الطلبات التي يرسلها العملاء لتسعيرها.", "إنشاء طلب يدويًا"] }, async b => {
  add(b, inst("filters-bar", { state: "default" }), "h")
  await table(b, [["رقم الطلب", 120], ["العميل", 200], ["المناسبة", 150], ["الموعد", 190], ["المدينة", 120], ["القيمة التقديرية", 150], ["الحالة", 150]], [
    ["#OC-1042", "نورة القحطاني", "عقيقة", "الجمعة 20 نوفمبر", "الرياض", "5,692.50 ر.س", ["بانتظار التسعير", "warning"]], ["#OC-1041", "سلطان العتيبي", "وليمة", "السبت 21 نوفمبر", "الخرج", "8,420.00 ر.س", ["أُرسل العرض", "info"]],
    ["#OC-1040", "أم خالد", "تفطير وصدقة", "الأحد 22 نوفمبر", "الرياض", "3,150.00 ر.س", ["قُبل العرض", "success"]], ["#OC-1039", "ماجد الشمري", "عزيمة ضيوف", "الخميس 19 نوفمبر", "الدرعية", "2,780.00 ر.س", ["انتهى العرض", "danger"]]])
})
// ---- admin: review and pricing --------------------------------------------------------------------------
const d2 = await dfamily({ path: "Occasions/Pricing", role: "admin", title: "مراجعة الطلب #OC-1042", crumb: "المناسبات / مراجعة وتسعير", add: "حفظ مسودة", exp: "طباعة", states: ["Quote sent", "Loading", "Error", "Denied"] }, async (b, st) => {
  const sent = st === "Quote sent"
  await dcols(b, async (m, w) => {
    add(m, await box(w, async (c, iw) => { add(c, await T("تفاصيل الطلب", "Heading/H3", "ink", iw), "h"); for (const [k, v] of [["العميل", "نورة القحطاني · 55 123 4567"], ["المناسبة", "عقيقة · 40 ضيفًا"], ["الموعد", "الجمعة 20 نوفمبر 2026 · 8 إلى 10 صباحًا"], ["الموقع", "الرياض، حي النرجس"], ["الطبخ", "مندي"]]) add(c, await kv(iw, k, v), "h") }, { pad: 24 }), "h")
    add(m, await box(w, async (c, iw) => { add(c, await T("التسعير", "Heading/H3", "ink", iw), "h")
      const fs = async (l, v, s) => field(l, v, s)
      await pair(c, await fs("سعر الخروف الواحد (ر.س)", "1,150.00", "filled"), await fs("عدد الخراف", "4", "filled")); await pair(c, await fs("الذبح والتقطيع (ر.س)", "200.00", "filled"), await fs("التوصيل (ر.س)", "150.00", "filled")) }, { pad: 24 }), "h") },
  async (s, w) => add(s, await box(w, async (c, iw) => {
    add(c, await T("ملخص العرض", "Heading/H3", "ink", iw), "h"); for (const [k, v] of [["المجموع", "4,950.00 ر.س"], ["الضريبة 15%", "742.50 ر.س"]]) add(c, await kv(iw, k, v), "h")
    add(c, await kv(iw, "الإجمالي", "5,692.50 ر.س", true), "h"); add(c, await kv(iw, "العربون 30%", "1,707.75 ر.س"), "h")
    if (sent) add(c, await note(iw, "success", "أُرسل العرض للعميل", "ينتهي الأحد 15 نوفمبر، 6:00 م."), "h")
    add(c, await button("إرسال العرض للعميل", "primary", sent ? "disabled" : "default"), "h"); add(c, await button("رفض الطلب", "danger", sent ? "disabled" : "default"), "h") }, { pad: 24 }), "h"))
})
// ---- admin: kitchens ------------------------------------------------------------------------------------
const d3 = await dfamily({ path: "Kitchens/List", role: "admin", title: "المطابخ", crumb: "المطابخ / كل المطابخ", add: "إضافة مطبخ", exp: "تصدير", states: ["Loading", "Empty", "Error", "Denied"],
  empty: ["cooking-pot", "لا توجد مطابخ", "أضف مطبخًا ليستقبل طلبات الطبخ.", "إضافة مطبخ"] }, async b => {
  await table(b, [["المطبخ", 250], ["المدينة", 140], ["السعة اليومية", 150], ["حمل اليوم", 140], ["المشرف", 200], ["الحالة", 160]], [
    ["مطبخ جزلة المركزي", "الرياض", "120 طبقًا", "84 طبقًا", "سلطان الدوسري", ["نشط", "success"]], ["مطبخ الخرج", "الخرج", "60 طبقًا", "22 طبقًا", "عبدالله المطيري", ["نشط", "success"]],
    ["مطبخ شمال الرياض", "الرياض", "80 طبقًا", "80 طبقًا", "ياسر القحطاني", ["مكتمل اليوم", "danger"]], ["مطبخ الدرعية", "الدرعية", "40 طبقًا", "0 طبق", "فيصل الزهراني", ["موقوف مؤقتًا", "warning"]]])
})
// ---- admin: Adha settings -------------------------------------------------------------------------------
const d4 = await dfamily({ path: "Adha/Settings", role: "admin", title: "إعدادات الأضحى 1448", crumb: "الأضحى / الإعدادات", add: "نشر الموسم", exp: "معاينة", states: ["Validation", "Loading", "Error", "Denied"] }, async (b, st) => {
  const bad = st === "Validation"
  await fsec(b, "مواعيد الموسم", "يظهر الحجز المبكر للعملاء ضمن هذه التواريخ فقط.", async f => { await pair(f, await field("بداية الحجز المبكر", "1 أبريل 2027", "filled"), await field("نهاية الحجز المبكر", "6 مايو 2027", "filled")); add(f, await field("يوم العيد المتوقع", "الأحد 16 مايو 2027", "filled", "يُحدَّث بعد رؤية الهلال")) })
  await fsec(b, "سعة الأيام", "عدد الأضاحي في اليوم، موزّعة على الفترات الصباحية.", async f => { await pair(f, await field("يوم العيد", bad ? "اكتب هنا" : "400", bad ? "error" : "filled", bad ? "أدخل سعة صحيحة" : undefined), await field("أول التشريق", "250", "filled")); await pair(f, await field("ثاني التشريق", "200", "filled"), await field("ثالث التشريق", "150", "filled")) })
  await fsec(b, "قيود التقطيع", "قواعد تحدّ خيارات العميل في أيام الضغط.", async f => { for (const [t, on] of [["منع المفروم يوم العيد", "yes"], ["الحاشي يُقطّع أرباعًا فقط", "yes"], ["السماح بالطبخ في يوم العيد", "no"]]) { const r = frame("rule", { dir: "HORIZONTAL", w: 640, main: "SPACE_BETWEEN", cross: "CENTER" }); add(r, await T(t, "Body/L", "ink")); add(r, inst("switch", { checked: on, state: "default" })); add(f, r) } })
  await actions(b, "حفظ الإعدادات", bad)
})
// ---- admin: per-day board -------------------------------------------------------------------------------
const d5 = await dfamily({ path: "Adha/DayBoard", role: "admin", title: "لوحة الأيام", crumb: "الأضحى / حجوزات الأيام", add: "تصدير اليوم", exp: "طباعة", states: ["Loading", "Empty", "Error", "Denied"],
  empty: ["calendar-blank", "لا حجوزات بعد", "تظهر حجوزات كل يوم هنا بعد فتح الموسم.", "فتح الموسم"] }, async b => {
  const k = frame("kpis", { dir: "HORIZONTAL", w: 1132, gap: 16 })
  for (const [l, v, d] of [["يوم العيد · 16 مايو", "318 / 400", "79% من السعة"], ["أول التشريق · 17 مايو", "231 / 250", "92% من السعة"], ["ثاني التشريق · 18 مايو", "200 / 200", "مكتمل"], ["ثالث التشريق · 19 مايو", "64 / 150", "43% من السعة"]]) { const c = inst("kpi-card", { trend: "up" }); await retext(c, "طلبات اليوم", l); await retext(c, "128", v); await retext(c, "12% عن أمس", d); add(k, c) }
  add(b, k, "h")
  await table(b, [["الفترة", 220], ["الحجوزات", 150], ["السعة", 150], ["أغنام", 130], ["إبل", 130], ["الحالة", 170]], [
    ["6:00 إلى 8:00 ص", "96", "100", "88", "8", ["شبه مكتمل", "warning"]], ["8:00 إلى 10:00 ص", "100", "100", "92", "8", ["مكتمل", "danger"]], ["10:00 ص إلى 12:00 م", "78", "100", "74", "4", ["متاح", "success"]], ["12:00 إلى 2:00 م", "44", "100", "42", "2", ["متاح", "success"]]], "يوم العيد · الفترات")
})
// ---- vendor: visits calendar ----------------------------------------------------------------------------
const VIS = { 18: [["8:00 ص", "سعد الغامدي · 2"]], 19: [["10:00 ص", "فهد الحربي · 3"], ["4:00 م", "نورة القحطاني · 2"]], 20: [["10:00 ص", "عبدالعزيز الشهري · 4"]], 21: [], 22: null }
const d6 = await dfamily({ path: "Visits/Calendar", role: "vendor", title: "جدول الزيارات", crumb: "الزيارات / الأسبوع", add: "فتح مواعيد", exp: "تصدير", states: ["Loading", "Empty", "Error", "Denied"],
  empty: ["calendar-x", "لا زيارات هذا الأسبوع", "افتح مواعيد زيارة ليحجزها العملاء.", "فتح مواعيد"] }, async b => {
  await dcols(b, async (m, w) => { const g = frame("week", { dir: "HORIZONTAL", w, gap: 8, cross: "MIN" })
    for (const [i, n] of [18, 19, 20, 21, 22].entries()) { const c = frame("day " + n, { w: 136, pad: 8, gap: 8, fill: "paper", stroke: n === 19 ? "ember" : "line", sw: n === 19 ? 2 : 1, r: "md" }); c.minHeight = 400
      add(c, await T(DOW[i] + " " + n, "Label/M", "ink", 120, "CENTER"), "h")
      if (VIS[n] === null) add(c, await pill("مغلق", "danger")); else for (const [t, who] of VIS[n]) { const v = frame("visit", { w: 120, pad: 8, gap: 4, fill: "sand", r: "sm" }); add(v, await T(t, "Label/M", "ink", 104), "h"); add(v, await T(who, "Body/M", "ink-2", 104), "h"); chk("visit", "ink-2", "sand"); add(c, v, "h") }
      add(g, c) }
    add(m, g, "h") }, async (s, w) => add(s, await box(w, async (c, iw) => { add(c, await T("اليوم الخميس 19 نوفمبر", "Heading/H3", "ink", iw), "h")
    for (const [t, who, n] of [["10:00 ص", "فهد الحربي", "3 زوار · 0555 123 456"], ["4:00 م", "نورة القحطاني", "2 زوار · 0500 987 654"]]) add(c, await opt(iw, "calendar-check", t + " · " + who, n, false), "h")
    add(c, await button("إغلاق اليوم", "secondary"), "h") }, { pad: 24 }), "h"), 748, 384)
})
// ---- vendor: animal registration ------------------------------------------------------------------------
const d7 = await dfamily({ path: "Animals/Register", role: "vendor", title: "تسجيل حيوان", crumb: "المواشي / تسجيل جديد", add: "حفظ وإتاحة", exp: "حفظ مسودة", states: ["Filled", "Validation", "Loading", "Error"] }, async (b, st) => {
  const f = st === "Filled", bad = st === "Validation", fs = (l, v, h) => field(l, bad && l.startsWith("السعر") ? "اكتب هنا" : f || bad ? v : null, bad && l.startsWith("السعر") ? "error" : f || bad ? "filled" : "default", bad && l.startsWith("السعر") ? "أدخل سعر الحيوان" : h)
  { const m = b // single column: the 1132 wide form section does not fit a 720 column
    await fsec(m, "بيانات الحيوان", "تظهر للعميل عند حجز الزيارة وفي بطاقة الحيوان.", async c => { const r = frame("types", { dir: "HORIZONTAL", gap: 8 }); for (const [i, t] of ["خروف نعيمي", "خروف حري", "ماعز بلدي", "حاشي"].entries()) add(r, await chip(t, i === 0 && (f || bad) ? "selected" : "default")); add(c, r)
      await pair(c, await fs("رقم الأذن", "0142"), await fs("الوزن (كجم)", "48")); await pair(c, await fs("العمر (أشهر)", "9"), await fs("السعر (ر.س)", "1,350.00", "شامل الذبح والتقطيع")) })
  }
  { const s = b, w = 1132; add(s, await box(w, async (c, iw) => { add(c, await T("صور الحيوان", "Heading/H3", "ink", iw), "h"); const g = frame("gallery row", { dir: "HORIZONTAL", gap: 8 })
    for (const k of f || bad ? ["sheep", "sheep", "camel-calf"] : ["sheep"]) add(g, await photo(112, 112, k, "gallery")); add(c, g)
    add(c, await button("رفع صورة", "secondary"), "h"); add(c, await button("حفظ وإتاحة للحجز", "primary", f ? "default" : "disabled"), "h") }, { pad: 24 }), "h") }
})
// ---- kitchen: board -------------------------------------------------------------------------------------
const COLS = [["جديد", "info", [["مندي لحم × 4", "#OC-1042 · عقيقة", "12:30 ظهرًا"], ["كبسة لحم × 2", "#OC-1043 · وليمة", "1:00 ظهرًا"]]], ["قيد الطبخ", "warning", [["مظبي ضأن × 3", "#OC-1040 · تفطير", "11:30 صباحًا"]]], ["جاهز", "success", [["مندي لحم × 6", "#OC-1038 · وليمة", "11:00 صباحًا"]]], ["تم التسليم", "neutral", [["مشاوي مشكّلة × 2", "#OC-1036 · عزيمة", "10:00 صباحًا"]]]]
const d8 = await dfamily({ path: "Kitchen/Board", role: "kitchen", title: "لوحة المطبخ · اليوم", crumb: "المطبخ / الطلبات الجارية", add: "طباعة بطاقات التحضير", exp: "تصدير", states: ["Loading", "Empty", "Error"],
  empty: ["cooking-pot", "لا طلبات طبخ اليوم", "تصل طلبات الطبخ هنا فور تأكيدها.", "عرض جدول الغد"] }, async b => {
  const r = frame("board", { dir: "HORIZONTAL", w: 1132, gap: 16, cross: "MIN" })
  for (const [t, kind, items] of COLS) { const c = frame("column " + t, { w: 271, pad: 12, gap: 12, fill: "sand", r: "md" }); c.minHeight = 520
    const h = frame("head", { dir: "HORIZONTAL", w: 247, main: "SPACE_BETWEEN", cross: "CENTER" }); add(h, await T(t, "Label/M", "ink")); add(h, await T(String(items.length), "Label/M", "ink-2")); add(c, h, "h"); chk("col head", "ink", "sand"); chk("col count", "ink-2", "sand")
    for (const [d, o, tm] of items) add(c, await box(247, async (x, iw) => { add(x, await T(d, "Label/M", "ink", iw), "h"); add(x, await T(o, "Body/M", "ink-2", iw), "h"); add(x, await pill("التسليم " + tm, kind === "neutral" ? "info" : kind)) }, { pad: 12, gap: 8 }), "h")
    add(r, c) }
  add(b, r, "h")
})
for (const [pg, list] of [[A, [[d1, "sec-occ-admin-occasions", "طلبات المناسبات · Occasions review", "قائمة الطلبات الواردة مع حالة التسعير."], [d2, "sec-occ-admin-pricing", "مراجعة الطلب وتسعيره · Occasion pricing"], [d3, "sec-occ-admin-kitchens", "المطابخ · Kitchens admin"], [d4, "sec-occ-admin-adha-settings", "إعدادات الأضحى · Adha settings"], [d5, "sec-occ-admin-adha-board", "لوحة أيام الأضحى · Adha per-day board"]]], [V, [[d6, "sec-occ-vendor-visits", "جدول الزيارات · Vendor visits calendar"], [d7, "sec-occ-vendor-animal", "تسجيل الحيوان · Animal registration"]]], [K, [[d8, "sec-occ-kitchen-board", "لوحة المطبخ · Kitchen board"]]]]) {
  ctx.y = await yOf(pg, OWN[pg])
  for (const [d, id, title, nt] of list) await sec(pg, id, title, [d], nt)
}
print("✅ OCC dashboards done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
