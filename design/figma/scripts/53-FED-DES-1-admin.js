// FED-DES-1 batch 4: moderation in the admin dashboard (page 30 Admin): listings moderation, chat reports list and report detail. Arabic RTL, components via _ds.js.
await loadDS()
const ctx = { y: 0 }
async function startY(pg, own) { await page(pg).loadAsync(); const rest = page(pg).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id"))); return rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }
const BADGE = { neutral: "جديد", info: "قيد المراجعة", warning: "قيد التجهيز", success: "تم التسليم", danger: "ملغي", brand: "ذُبح اليوم" }
const bdg = async (type, label, size = "S") => { const b = inst("badge", { type, size }); await retext(b, BADGE[type], label); return b }
const _seen = new Set()
// text + automatic contrast registration (bg = key of the surface it sits on)
async function tx(s, style = "Body/M", color = "ink", bg = "paper", w) { const k = color + "|" + bg + "|" + style; if (!_seen.has(k)) { _seen.add(k); chk(`${style} ${color} on ${bg}`, color, bg, style === "Display/L" || style === "Heading/H1" ? 3 : 4.5) } return txt(s, style, color, w ? { w } : {}) }
async function photoBox(name, w, h, key, r = "md") { const f = frame(name, { dir: "HORIZONTAL", w, h, main: "CENTER", cross: "CENTER", fill: "sand", r, clip: true }); add(f, await icon("image", Math.max(16, Math.min(32, h - 12)), "ink-2")); f.setSharedPluginData(NS, "photo", key); chk("photo icon", "ink-2", "sand", 3); return f }
async function mapBox(w, h) { const f = frame("map", { dir: "HORIZONTAL", w, h, main: "CENTER", cross: "CENTER", fill: "sand", r: "md", clip: true }); add(f, await icon("map-pin", 32, "ink-2")); return f }
async function card(title, w = 1132, o = {}) { const c = frame(o.name || "card", { w, pad: 24, gap: 16, fill: o.fill || "paper", stroke: "line", r: "md" }); if (title) add(c, await tx(title, "Heading/H2", "ink", "paper", w - 48), "h"); return c }
// label / value pairs, one per row
async function kv(pairs, w, bg = "paper") { const g = frame("details", { w, gap: 12 }); for (const [k, v] of pairs) { const r = frame("row", { dir: "HORIZONTAL", w, gap: 12, main: "SPACE_BETWEEN" }); add(r, await tx(k, "Body/M", "ink-2", bg)); add(r, await tx(v, "Label/M", "ink", bg)); add(g, r, "h") } return g }
const fld = (label, val, st, hint) => field(label, val, st, hint)
async function frow(fields, w = 752) { const r = frame("fields", { dir: "HORIZONTAL", w, gap: 24 }); for (const f of fields) add(r, f, "h"); return r }
async function note(text, w, icn = "info", fill = "sand") { const f = frame("notice", { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, cross: "CENTER", fill, r: "md" }); add(f, await icon(icn, 24, "ink")); add(f, await tx(text, "Body/M", "ink", fill, w - 76), "h"); return f }
async function tableOf(cols, rows, w = 1132, o = {}) {
  const c = frame("data-table", { w, fill: "paper", stroke: "line", r: "md", clip: true }), H = o.rowH || 64
  const cell = (cw, h) => frame("cell", { dir: "HORIZONTAL", w: cw, h, cross: "CENTER", px: 8 })
  const hd = frame("header", { dir: "HORIZONTAL", px: 24, h: 48, cross: "CENTER", fill: "sand" })
  for (const [t, cw] of cols) { const k = cell(cw, 48); if (t) add(k, await tx(t, "Label/M", "ink", "sand")); add(hd, k) }
  add(c, hd, "h")
  for (let r = 0; r < rows.length; r++) {
    const row = frame("row", { dir: "HORIZONTAL", px: 24, h: H, cross: "CENTER" }); row.strokes = [paint("line")]; row.strokeTopWeight = 0; row.strokeBottomWeight = 1; row.strokeLeftWeight = 0; row.strokeRightWeight = 0
    for (let i = 0; i < cols.length; i++) {
      const k = cell(cols[i][1], H), v = rows[r][i]
      if (o.skel) { if (cols[i][0] || i === 0) add(k, rect("sk", Math.max(24, Math.min(cols[i][1] - 24, 70 + (r * 23 + i * 17) % 70)), 12, "sand", "pill")) }
      else if (v && v.b) add(k, await bdg(...v.b)); else if (v && v.ph) { const m = frame("cellmain", { dir: "HORIZONTAL", gap: 12, cross: "CENTER" }); add(m, await photoBox("photo thumb", 44, 44, v.ph[0], "sm")); add(m, await tx(v.ph[1], "Label/M", "ink", "paper")); add(k, m) }
      else if (v && v.ic) add(k, await icon(v.ic, 22, "ink-2")); else if (v && v.btn) add(k, await button(v.btn, "secondary", "default", "S")); else if (v != null) add(k, await tx(v, "Body/M", "ink", "paper"))
      add(row, k)
    }
    add(c, row, "h")
  }
  return c
}
const PD = { orders: ["لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب"], error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], denied: ["ليست لديك صلاحية", "تواصل مع مدير الحساب للحصول على الوصول.", "رجوع"], search: ["لا توجد نتائج", "جرّب كلمات أخرى أو غيّر عوامل التصفية.", "مسح التصفية"] }
async function panel(kind, title, text, cta, w = 1132, h = 360) { const p = inst("state-panel", { kind }), d = PD[kind]; await retext(p, d[0], title); await retext(p, d[1], text); await retext(p, d[2], cta); const c = frame("state " + kind, { dir: "HORIZONTAL", w, h, main: "CENTER", cross: "CENTER", fill: "paper", stroke: "line", r: "md" }); add(c, p); return c }
// dashboard screen that hugs its content; acts = [primary label, secondary label|null] or null for no page actions
async function dash(role, path, title, crumb, acts, minH = 1024) {
  const b = await dashScreen({ path, role, title, crumb, actions: acts ? undefined : false }), s = b.screen
  if (acts) { const ph = s.findOne(n => n.type === "INSTANCE" && n.name === "Page header"); for (const [from, to] of [["إضافة", acts[0]], ["تصدير", acts[1]]]) { if (to) await retext(ph, from, to); else { const i = ph.findOne(n => n.type === "INSTANCE" && n.findOne(t => t.type === "TEXT" && t.characters === from)); if (i) i.visible = false } } }
  for (const n of [b.body, b.body.parent, b.body.parent.parent]) n.layoutSizingVertical = "HUG"
  s.counterAxisSizingMode = "AUTO"; try { s.minHeight = minH } catch (e) {}
  s.children.find(n => n.type === "INSTANCE").layoutSizingVertical = "FILL"
  return b
}
// base screen + copies per state; fill(body, stateKey) builds each body
async function variants(S, base, fill, states) {
  await fill(base.body, "default"); S.main.push(base.screen)
  for (const [st, label] of states) { const c = stateCopy(base, label); await fill(c.body, st); S.states.push(c.screen) }
}
async function skeletonBody(body, w = 1132, n = 5) { for (let i = 0; i < n; i++) add(body, rect("loading sk", w, i ? 56 : 120, "sand", "md")) }
// dim the screen and float a dialog over it
async function modal(screen, title, build, w = 520) {
  const sc = rect("scrim", screen.width, screen.height, "ink", null, { alpha: 0.55 }); screen.appendChild(sc); sc.layoutPositioning = "ABSOLUTE"; sc.x = 0; sc.y = 0
  const d = frame("dialog", { w, pad: 24, gap: 16, fill: "paper", r: "lg" }); add(d, await tx(title, "Heading/H2", "ink", "paper", w - 48), "h"); await build(d)
  screen.appendChild(d); d.layoutPositioning = "ABSOLUTE"; d.x = Math.round((screen.width - w) / 2); d.y = 160; return d
}
async function btnRow(items, w) { const r = frame("actions", { dir: "HORIZONTAL", w, gap: 12 }); for (const [l, v, s] of items) add(r, await button(l, v, s || "default"), "h"); return r }
// filters bar instance with real labels. active = { v: "نشط", chips: ["الحالة: نشط", "المدينة: الرياض"] }
async function fb(search, labels, date, active) {
  const f = inst("filters-bar", { state: active ? "active" : "default" }); await retext(f, "بحث", search)
  if (active) { await retext(f, "قيد التجهيز", active.v); await retext(f, "الحالة: قيد التجهيز", active.chips[0]); await retext(f, "المتجر: مجازر الفلاح", active.chips[1]) }
  for (const l of active ? labels.slice(1) : labels) await retext(f, "الحالة", l)
  await retext(f, "التاريخ", date); return f
}
async function tabs3(a, active) { const t = inst("tabs", { active: String(active) }); await retext(t, "الوصف", a[0]); await retext(t, "المكوّنات", a[1]); await retext(t, "التقييمات", a[2]); return t }
const P = "30 Admin"
ctx.y = await startY(P, ["sec-fed-admin-listings", "sec-fed-admin-reports", "sec-fed-admin-report-detail"])
const listFill = c => async (body, st) => {
  const f = st === "filtered"
  add(body, await fb(c.search, c.labels, c.date, f && { v: c.fv, chips: c.fchips }), "h")
  if (st === "denied") return add(body, await panel("denied", c.deny[0], c.deny[1], "العودة للوحة المعلومات"), "h")
  add(body, await tabs3(c.tabs, f ? 2 : 1))
  if (st === "loading") return add(body, await tableOf(c.cols, c.rows, 1132, { skel: true }), "h")
  if (st === "error") return add(body, await panel("error", c.err[0], c.err[1], "إعادة المحاولة"), "h")
  if (st === "empty") return add(body, await panel("search", c.empty[0], c.empty[1], "مسح التصفية"), "h")
  add(body, await tableOf(c.cols, f ? c.frows : c.rows), "h")
}
const STATES = [["loading", "Loading"], ["empty", "Empty"], ["error", "Error"], ["denied", "Permission denied"], ["filtered", "Filtered"]]

// ---- Listings moderation -------------------------------------------------------------------------------------------------
const LC = [["الإعلان", 310], ["البائع", 210], ["النوع", 90], ["السعر", 130], ["المدينة", 100], ["الحالة", 130], ["", 110]]
const LR = [
  [{ ph: ["sheep", "برسيم حجازي درجة أولى"] }, "مؤسسة وادي الخير للأعلاف", "برسيم", "38.00 ر.س", "الخرج", { b: ["info", "قيد المراجعة"] }, { btn: "مراجعة" }],
  [{ ph: ["camel", "شعير مطحون للإبل"] }, "مزارع النخيل للأعلاف", "شعير", "92.00 ر.س", "الرياض", { b: ["success", "منشور"] }, { btn: "مراجعة" }],
  [{ ph: ["lamb-raw", "علف أغنام مركّز"] }, "سلطان القحطاني", "علف", "135.00 ر.س", "بريدة", { b: ["info", "قيد المراجعة"] }, { btn: "مراجعة" }],
  [{ ph: ["dryage", "علف ماشية حلّاب"] }, "مؤسسة السهل للأعلاف", "علف", "148.00 ر.س", "الأحساء", { b: ["warning", "مُبلَّغ عنه"] }, { btn: "مراجعة" }],
  [{ ph: ["camel-saddle", "تبن قمح مكبوس"] }, "عبدالله الشمري", "تبن", "21.00 ر.س", "حائل", { b: ["danger", "مرفوض"] }, { btn: "مراجعة" }],
  [{ ph: ["camel-calf", "برسيم رودس أخضر"] }, "فهد الدوسري", "برسيم", "30.00 ر.س", "الرياض", { b: ["danger", "محظور"] }, { btn: "مراجعة" }],
]
const lfill = listFill({ search: "ابحث بعنوان الإعلان أو اسم البائع", labels: ["حالة الإعلان", "المدينة", "نوع العلف"], date: "تاريخ النشر", fv: "قيد المراجعة", fchips: ["الحالة: قيد المراجعة", "المدينة: الرياض"],
  tabs: ["بانتظار المراجعة (14)", "منشورة", "مرفوضة ومحظورة"], cols: LC, rows: LR, frows: [LR[0], LR[2]], deny: ["ليست لديك صلاحية لإشراف الإعلانات", "هذه الصفحة متاحة لمشرفي سوق الأعلاف ومدير المنصة فقط."],
  err: ["تعذّر تحميل الإعلانات", "حدث خطأ أثناء جلب قائمة الإعلانات. حاول مرة أخرى."], empty: ["لا توجد إعلانات مطابقة", "لا توجد إعلانات بهذه المرشحات. جرّب مسحها."] })
const lbase = await dash("admin", "Feed/Listings", "إشراف الإعلانات", "سوق الأعلاف / الإعلانات", ["تصدير القائمة", null])
await screenSection(ctx, P, "sec-fed-admin-listings", "إشراف الإعلانات · Listings moderation", async S => {
  S.note = "الإعلان الجديد لا يظهر في السوق قبل اعتماده. الإزالة تتطلب سببًا يصل إلى البائع ويُسجَّل في سجل التدقيق."
  await variants(S, lbase, lfill, STATES)
  const c = stateCopy(lbase, "Remove dialog", true); await modal(c.screen, "إزالة إعلان «برسيم حجازي درجة أولى»", async d => {
    add(d, await tx("لن يظهر الإعلان في السوق، وسيصل السبب إلى مؤسسة وادي الخير للأعلاف.", "Body/M", "ink-2", "paper", 472), "h")
    const ch = frame("reasons", { dir: "HORIZONTAL", gap: 8, w: 472 }); ch.layoutWrap = "WRAP"; for (const [i, t] of ["سعر مضلل", "محتوى مخالف", "صور غير مناسبة"].entries()) add(ch, await chip(t, i === 0 ? "selected" : "default")); add(d, ch, "h")
    add(d, await fld("ملاحظة للبائع", "السعر المعلن لا يطابق السعر المتفق عليه في المحادثات", "filled", "تظهر للبائع كما هي"), "h")
    add(d, await btnRow([["إزالة الإعلان", "danger"], ["إلغاء", "secondary"]], 472), "h") })
  S.states.push(c.screen)
})

// ---- Chat reports list -----------------------------------------------------------------------------------------------------
const RC = [["السبب", 180], ["المحادثة", 230], ["الإعلان", 210], ["المُبلِّغ", 140], ["الوقت", 100], ["الحالة", 110], ["", 110]]
const RR = [
  ["احتيال أو سعر مضلل", "سلطان القحطاني مع مؤسسة السهل", "علف ماشية حلّاب", "سلطان القحطاني", "قبل 12 دقيقة", { b: ["danger", "جديد"] }, { btn: "فتح" }],
  ["إزعاج أو تحرش", "نورة العتيبي مع فهد الدوسري", "برسيم رودس أخضر", "نورة العتيبي", "قبل ساعتين", { b: ["danger", "جديد"] }, { btn: "فتح" }],
  ["محتوى مخالف أو مسيء", "ماجد الحربي مع عبدالله الشمري", "تبن قمح مكبوس", "ماجد الحربي", "أمس", { b: ["info", "قيد المعالجة"] }, { btn: "فتح" }],
  ["سبب آخر", "منصور الدوسري مع مزارع النخيل", "شعير مطحون للإبل", "منصور الدوسري", "الأحد", { b: ["success", "مغلق"] }, { btn: "فتح" }],
]
const rfill = listFill({ search: "ابحث برقم البلاغ أو اسم المستخدم", labels: ["حالة البلاغ", "السبب", "المدينة"], date: "تاريخ البلاغ", fv: "جديد", fchips: ["الحالة: جديد", "السبب: احتيال"],
  tabs: ["جديدة (6)", "قيد المعالجة", "مغلقة"], cols: RC, rows: RR, frows: [RR[0]], deny: ["ليست لديك صلاحية لعرض البلاغات", "محتوى المحادثات متاح لمشرفي المحتوى فقط."],
  err: ["تعذّر تحميل البلاغات", "حدث خطأ أثناء جلب البلاغات. حاول مرة أخرى."], empty: ["لا توجد بلاغات مطابقة", "لا توجد بلاغات بهذه المرشحات. جرّب مسحها."] })
const rbase = await dash("admin", "Feed/Reports", "بلاغات المحادثات", "سوق الأعلاف / البلاغات", ["تصدير القائمة", null])
await screenSection(ctx, P, "sec-fed-admin-reports", "بلاغات المحادثات · Chat reports", async S => { S.note = "البلاغات الجديدة أولًا. فتح البلاغ يكشف نص المحادثة للمشرف ويُسجَّل في سجل التدقيق."; await variants(S, rbase, rfill, STATES) })

// ---- Report detail ---------------------------------------------------------------------------------------------------------------
async function tmsg(name, text, time, o = {}) {
  const m = frame("message", { w: 700, gap: 4 }), h = frame("who", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" })
  add(h, await tx(name, "Label/M", "ink", "paper")); add(h, await tx(time, "Caption", "ink-2", "paper")); if (o.flag) add(h, await bdg("danger", "الرسالة المُبلَّغ عنها")); add(m, h)
  const b = frame("bubble", { pad: o.img ? 4 : 12, gap: 8, fill: o.flag ? "danger-bg" : "sand", r: "md" }); chk("transcript text", "ink", o.flag ? "danger-bg" : "sand")
  if (o.img) add(b, await photoBox("photo chat image", 280, 190, o.img, "sm")); else add(b, await txt(text, "Body/M", "ink", { w: Math.min(640, text.length * 9 + 8) }))
  if (o.img) add(b, await txt(text, "Body/M", "ink", { w: 280 })); add(m, b); return m
}
async function detailBody(body, st) {
  if (st === "loading") return skeletonBody(body)
  if (st === "error") return add(body, await panel("error", "تعذّر تحميل البلاغ", "حدث خطأ أثناء جلب المحادثة. حاول مرة أخرى.", "إعادة المحاولة"), "h")
  if (st === "denied") return add(body, await panel("denied", "ليست لديك صلاحية لعرض المحادثة", "محتوى المحادثات متاح لمشرفي المحتوى فقط.", "رجوع"), "h")
  const row = frame("layout", { dir: "HORIZONTAL", w: 1132, gap: 24, cross: "MIN" })
  const tc = await card("نص المحادثة", 748, { name: "transcript card" })
  add(tc, await note("الرسائل ظاهرة لك لأن المحادثة مُبلَّغ عنها، ويُسجَّل هذا الاطلاع.", 700), "h")
  add(tc, await tmsg("مؤسسة السهل للأعلاف", "السعر 148.00 ر.س للكيس، حوّل عربونًا 500.00 ر.س على الحساب قبل الشحن.", "9:02 ص", { flag: true }), "h")
  add(tc, await tmsg("سلطان القحطاني", "هل يمكن المعاينة أولًا في المزرعة؟", "9:05 ص"), "h")
  add(tc, await tmsg("مؤسسة السهل للأعلاف", "لا، التحويل أولًا ثم نرسل الصورة.", "9:06 ص", { img: "dryage" }), "h")
  add(tc, await tmsg("سلطان القحطاني", "سأبلّغ عن الإعلان.", "9:10 ص"), "h"); add(row, tc)
  const R = frame("aside", { w: 360, gap: 24 }), sm = await card("تفاصيل البلاغ", 360, { name: "summary" })
  add(sm, await kv([["السبب", "احتيال أو سعر مضلل"], ["المُبلِّغ", "سلطان القحطاني"], ["المُبلَّغ عنه", "مؤسسة السهل للأعلاف"], ["الإعلان", "علف ماشية حلّاب"], ["وقت البلاغ", "11 نوفمبر 2026 · 9:18 ص"], ["بلاغات سابقة", "2"]], 312), "h"); add(R, sm, "h")
  const dc = await card("القرار", 360, { name: "decision" })
  add(dc, await button("إزالة الإعلان", "secondary"), "h"); add(dc, await button("تحذير المستخدم", "secondary"), "h"); add(dc, await button("حظر المستخدم", "danger"), "h"); add(dc, await button("تجاهل البلاغ", "ghost"), "h")
  add(R, dc, "h"); add(row, R); add(body, row)
}
const dbase = await dash("admin", "Feed/ReportDetail", "بلاغ #2041", "البلاغات / بلاغ #2041", null, 1100)
await screenSection(ctx, P, "sec-fed-admin-report-detail", "تفاصيل البلاغ · Report detail", async S => {
  S.note = "الحظر يمنع المستخدم من المراسلة والنشر ويُسجَّل سببه. تجاهل البلاغ يغلقه دون إجراء ويُسجَّل في سجل التدقيق."
  await variants(S, dbase, detailBody, [["loading", "Loading"], ["error", "Error"], ["denied", "Permission denied"]])
  const c = stateCopy(dbase, "Block dialog", true); await modal(c.screen, "حظر مؤسسة السهل للأعلاف", async d => {
    add(d, await tx("لن يتمكن المستخدم من مراسلة أحد أو نشر إعلانات، وتُخفى إعلاناته من السوق.", "Body/M", "ink-2", "paper", 472), "h")
    add(d, await fld("سبب الحظر", "طلب تحويل عربون قبل المعاينة وبلاغات متكررة", "filled", "يُسجَّل في سجل التدقيق"), "h")
    add(d, await btnRow([["حظر المستخدم", "danger"], ["إلغاء", "secondary"]], 472), "h") })
  S.states.push(c.screen)
})

print("✅ FED admin done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
