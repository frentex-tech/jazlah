const OWN = ["sec-opx-a-staff","sec-opx-a-audit","sec-opx-a-campaign","sec-opx-a-denied"]
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
chk("diff removed", "ink", "danger-bg"); chk("diff added", "ink", "sand")
const SDEN = "إدارة الموظفين والصلاحيات متاحة للمدير العام فقط."
// ---- Staff and roles -----------------------------------------------------------------------------------------
const ROLES = ["مدير عام", "مشرف عمليات", "المالية", "دعم العملاء", "مشرف توصيل"]
const PERM = [["الطلبات", [1, 1, 0, 1, 1]], ["العملاء", [1, 1, 0, 1, 0]], ["الشكاوى", [1, 1, 0, 1, 0]], ["التوصيل", [1, 1, 0, 0, 1]], ["المالية", [1, 0, 1, 0, 0]], ["الحملات التسويقية", [1, 1, 0, 0, 0]], ["الموظفون والصلاحيات", [1, 0, 0, 0, 0]], ["سجل التدقيق", [1, 0, 1, 0, 0]]]
await screenSection(ctx, P, "sec-opx-a-staff", "الموظفون والصلاحيات · Admin staff & roles", async S => {
  S.note = "قائمة الموظفين ومصفوفة الصلاحيات حسب الدور؛ التعديل يُسجَّل في سجل التدقيق."
  await feature(S, "Staff/List", "الموظفون", "الموظفون والصلاحيات / الموظفون", async b => {
    add(b, await table([["الموظف", 260], ["الجوال", 190], ["الدور", 200], ["آخر دخول", 220], ["الحالة", 214]], [["ليلى الغامدي", L("+966 55 210 7788"), "دعم العملاء", "اليوم 9:12 ص", { b: ["success", "نشط"] }], ["عبدالله السهلي", L("+966 50 664 1023"), "مدير عام", "اليوم 8:40 ص", { b: ["success", "نشط"] }], ["هند القرني", L("+966 54 118 9035"), "المالية", "9 نوفمبر 2026", { b: ["success", "نشط"] }], ["يوسف البلوي", L("+966 56 372 4410"), "مشرف توصيل", "2 نوفمبر 2026", { b: ["neutral", "موقوف"] }]], { pg: "عرض 1 إلى 4 من 12" }), "h")
  }, { acts: ["دعوة موظف", "تصدير"], denied: SDEN, h: 820, empty: ["لا يوجد موظفون", "ادعُ أول موظف لتمنحه دورًا وصلاحيات.", "دعوة موظف"] })
  await feature(S, "Staff/Matrix", "مصفوفة الصلاحيات", "الموظفون والصلاحيات / الصلاحيات", async b => {
    add(b, await table([["الصلاحية", 264], ...ROLES.map(r => [r, 164])], PERM.map(([n, v]) => [n, ...v.map(x => ({ ck: !!x }))])), "h")
    const a = row(12); add(a, await btn("حفظ التغييرات", "primary")); add(a, await btn("تراجع", "ghost")); add(b, a)
  }, { acts: ["دور جديد", "تصدير"], denied: SDEN, h: 920, skip: ["Empty"] })
})

// ---- Audit log -----------------------------------------------------------------------------------------------
await screenSection(ctx, P, "sec-opx-a-audit", "سجل التدقيق · Admin audit log", async S => {
  S.note = "كل إجراء إداري مسجَّل بالموظف والوقت؛ عرض الفروقات يقارن القيمة قبل التعديل وبعدها."
  await feature(S, "Audit/List", "سجل التدقيق", "سجل التدقيق", async b => {
    add(b, filters(false), "h")
    add(b, await table([["الوقت", 190], ["الموظف", 190], ["الإجراء", 250], ["الكيان", 190], ["عنوان IP", 264]], [["10 نوفمبر 2026 · 11:42 ص", "ليلى الغامدي", { l: "استرجاع مبلغ" }, "الطلب #10479", L("185.93.12.40")], ["10 نوفمبر 2026 · 10:05 ص", "عبدالله السهلي", { l: "تعديل صلاحيات" }, "دور المالية", L("185.93.12.18")], ["9 نوفمبر 2026 · 4:30 م", "هند القرني", { l: "اعتماد دفعة" }, "الدفعة #P-0403", L("94.99.201.7")], ["9 نوفمبر 2026 · 1:12 م", "عبدالله السهلي", { l: "تعديل سعر توصيل" }, "إعدادات التوصيل", L("185.93.12.18")]], { pg: "عرض 1 إلى 4 من 1,204" }), "h")
  }, { acts: ["تصدير السجل", "تصدير"], denied: "سجل التدقيق متاح للمدير العام والمالية فقط.", h: 860, empty: ["لا توجد سجلات", "جرّب توسيع نطاق التاريخ أو إزالة المرشحات.", "مسح المرشحات"] })
  const side = async (title, rows, tone) => { const c = await card(title, { w: 554 }); for (const [k, v, ch] of rows) { const r = row(12, { w: 514, main: "SPACE_BETWEEN", cross: "CENTER" }); r.fills = ch ? [paint(ch === "-" ? "danger-bg" : "sand")] : []; r.paddingLeft = r.paddingRight = 12; r.paddingTop = r.paddingBottom = 8; add(r, await txt(k, "Body/M", "ink")); add(r, await txt(v, "Body/M", "ink")); add(c, r, "h") } return c }
  await feature(S, "Audit/Diff", "تعديل صلاحيات #A-9120", "سجل التدقيق / #A-9120", async b => {
    const m = await card("تفاصيل الإجراء", { w: 1132 }); await kv(m, [["الموظف", "عبدالله السهلي"], ["الوقت", "10 نوفمبر 2026 · 10:05 ص"], ["الكيان", "دور المالية"], ["عنوان IP", L("185.93.12.18")]], 1092); add(b, m, "h")
    const r = row(24, { w: 1132, cross: "MIN" })
    add(r, await side("قبل التعديل", [["الطلبات", "عرض فقط"], ["المالية", "عرض وتعديل"], ["الحملات التسويقية", "غير مسموح", "-"], ["سجل التدقيق", "غير مسموح", "-"]]))
    add(r, await side("بعد التعديل", [["الطلبات", "عرض فقط"], ["المالية", "عرض وتعديل"], ["الحملات التسويقية", "عرض فقط", "+"], ["سجل التدقيق", "عرض فقط", "+"]])); add(b, r, "h")
  }, { h: 720, skip: ["Empty", "Denied"] })
})

// ---- Campaign composer ---------------------------------------------------------------------------------------
await screenSection(ctx, P, "sec-opx-a-campaign", "الحملات · Admin campaign composer", async S => {
  S.note = "إنشاء حملة تسويقية؛ الإرسال لمن وافق على الإشعارات التسويقية فقط."
  const composer = filled => async b => {
    const r = row(24, { w: 1132, cross: "MIN" }), f = await card("تفاصيل الحملة", { w: 730 })
    add(f, await field("اسم الحملة", filled ? "عروض عيد الأضحى المبكرة" : null, filled ? "filled" : "default"), "h")
    add(f, await field("الجمهور المستهدف", filled ? "عملاء الرياض · طلبوا آخر 90 يومًا (1,284 عميل)" : null, filled ? "filled" : "default"), "h")
    const ch = row(8); add(ch, await chip("إشعار التطبيق", "selected")); add(ch, await chip("رسالة SMS", filled ? "selected" : "default")); add(ch, await chip("البريد الإلكتروني")); add(f, ch)
    add(f, await field("نص الرسالة", filled ? "احجز أضحيتك الآن بخصم 15% على الأغنام النعيمي حتى 20 نوفمبر." : null, filled ? "filled" : "default", "الحد الأقصى 160 حرفًا"), "h")
    add(f, await field("موعد الإرسال", filled ? "12 نوفمبر 2026 · 10:00 ص" : null, filled ? "filled" : "default"), "h")
    const a = row(12); add(a, await btn("إرسال الحملة", "primary", filled ? "default" : "disabled")); add(a, await btn("حفظ كمسودة")); add(f, a); add(r, f)
    const pv = await card("معاينة الإشعار", { w: 378 })
    const n = frame("notification", { w: 338, pad: 16, gap: 8, fill: "bg", stroke: "line", r: "md" })
    add(n, await txt("جزلة", "Label/M", "ink")); add(n, await txt(filled ? "احجز أضحيتك الآن بخصم 15% على الأغنام النعيمي حتى 20 نوفمبر." : "نص الرسالة يظهر هنا أثناء الكتابة.", "Body/M", "ink-2", { w: 306 }), "h"); add(pv, n, "h")
    add(pv, await txt("سيصل إلى 1,284 عميلًا وافقوا على الإشعارات التسويقية.", "Body/M", "ink-2", { w: 338 }), "h"); add(r, pv); add(b, r, "h")
  }
  await feature(S, "Campaigns/Composer", "حملة جديدة", "الحملات / حملة جديدة", composer(false), { acts: ["حفظ كمسودة", "معاينة"], h: 1000, denied: "الحملات التسويقية متاحة لمشرف العمليات والمدير العام فقط.", skip: ["Empty"],
    filled: composer(true),
    extra: [["Sent", async b => { const t = inst("toast", { type: "success" }); await TXT(t, "تمت جدولة الحملة إلى 1,284 عميلًا"); const w = frame("host", { dir: "HORIZONTAL", w: 1132, h: 480, main: "CENTER", cross: "CENTER", fill: "paper", stroke: "line", r: "md" }); add(w, t); add(b, w, "h") }]] })
})

// ---- Permission-denied page ----------------------------------------------------------------------------------
await screenSection(ctx, P, "sec-opx-a-denied", "رفض الصلاحية · Admin permission denied", async S => {
  S.note = "تظهر عند فتح صفحة خارج صلاحيات الدور الحالي؛ تبقى القائمة الجانبية ظاهرة."
  await feature(S, "Denied/Page", "سجل التدقيق", "سجل التدقيق", async b => {
    const w = frame("state", { dir: "HORIZONTAL", w: 1132, h: 560, main: "CENTER", cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
    const p = inst("state-panel", { kind: "denied" }); await retext(p, "تواصل مع مدير الحساب للحصول على الوصول.", "دورك الحالي (دعم العملاء) لا يتضمن عرض سجل التدقيق. تواصل مع المدير العام لطلب الوصول."); add(w, p); add(b, w, "h")
  }, { h: 860, skip: ["Empty", "Denied"] })
})

print("✅ OPX-DES-1 admin part B (77-OPX-DES-1-admin-staff-audit-campaign) done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
