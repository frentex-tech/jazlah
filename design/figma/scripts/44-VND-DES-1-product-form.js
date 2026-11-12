// ---- shared helpers (same block in 40..43). Arabic RTL, components only, colors/styles through variables ----
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
// form section: title + help on the right, fields on the left (same layout as the form-section component, with real content)
async function fsec(title, sub, build, err) {
  const c = frame("form-section", { dir: "HORIZONTAL", w: 1132, pad: 24, gap: 32, fill: "paper", stroke: err ? "danger" : "line", r: "md", cross: "MIN" })
  const i = frame("info", { w: 280, gap: 8 }); add(i, await tx(title, "Heading/H2", "ink", "paper", 280), "h"); add(i, await tx(sub, "Body/M", "ink-2", "paper", 280), "h")
  const f = frame("fields", { w: 772, gap: 20 }); await build(f); add(c, i); add(c, f); return c
}
async function formActions(w, save, cancel, hideDel) {
  const a = inst("form-actions"); await retext(a, "حفظ", save); await retext(a, "إلغاء", cancel)
  if (hideDel) { const d = a.findOne(n => n.type === "INSTANCE" && n.findOne(t => t.type === "TEXT" && t.characters === "حذف المنتج")); if (d) d.visible = false }
  return a
}
const P = "31 Vendor"
ctx.y = await startY(P, ["sec-vnd-product-form", "sec-vnd-product-feedback"])
const box = async (t, w, err) => { const b = frame("value", { dir: "HORIZONTAL", w, h: 44, px: 12, cross: "CENTER", fill: "paper", stroke: err ? "danger" : "line", r: "sm" }); add(b, await tx(t || "", "Body/M", "ink", "paper")); return b }
const CUTS = ["تقطيع شرائح", "مكعبات", "مفروم ناعم", "قطعة كاملة", "شرائح سميكة", "عظم مفصّل"], PACK = ["كيس مفرغ", "علبة مبرّدة", "كرتون مبرّد", "تغليف هدية"]
const MX = [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 0, 0], [0, 1, 1, 1], [1, 1, 1, 0], [1, 0, 1, 0]]
async function matrix(w) {
  const m = frame("compatibility matrix", { w, gap: 8 })
  const hd = frame("header", { dir: "HORIZONTAL", w, gap: 0, cross: "CENTER" }); add(hd, frame("corner", { w: 172, h: 44 }))
  for (const p of PACK) { const c = frame("col", { dir: "HORIZONTAL", w: 150, h: 44, main: "CENTER", cross: "CENTER" }); add(c, await tx(p, "Label/M", "ink", "paper", 140)); add(hd, c) }
  add(m, hd, "h")
  for (const [r, cut] of CUTS.entries()) {
    const row = frame("row", { dir: "HORIZONTAL", w, cross: "CENTER", fill: r % 2 ? "bg" : null, r: "sm" }); const l = frame("rowlabel", { dir: "HORIZONTAL", w: 172, h: 52, px: 8, cross: "CENTER" }); add(l, await tx(cut, "Label/M", "ink", r % 2 ? "bg" : "paper")); add(row, l)
    for (let k = 0; k < 4; k++) { const c = frame("cell", { dir: "HORIZONTAL", w: 150, h: 52, main: "CENTER", cross: "CENTER" }), on = MX[r][k]
      const b = frame(on ? "compatible" : "incompatible", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: on ? "ember" : "paper", stroke: on ? null : "line", r: "sm" }); add(b, await icon(on ? "check" : "minus", 22, on ? "paper" : "ink-2")); add(c, b); add(row, c) }
    add(m, row, "h")
  }
  chk("matrix check", "paper", "ember", 3); chk("matrix minus", "ink-2", "paper", 3)
  const lg = frame("legend", { dir: "HORIZONTAL", gap: 24, cross: "CENTER" }); for (const [on, t] of [[1, "متوافق"], [0, "غير متوافق، يظهر للعميل معطّلًا مع السبب"]]) { const i = frame("item", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" }); add(i, rect("key", 20, 20, on ? "ember" : "paper", "sm", { stroke: on ? null : "line" })); add(i, await tx(t, "Body/M", "ink-2", "paper")); add(lg, i) }
  add(m, lg); return m
}
async function formBody(body, st) {
  const e = st === "empty", er = st === "error", v = a => (e ? null : a), S = e ? "default" : "filled"
  if (st === "loading") return skeletonBody(body, 1132, 6)
  if (st === "loadfail") return add(body, await panel("error", "تعذّر تحميل المنتج", "تحقق من اتصالك ثم أعد المحاولة.", "إعادة المحاولة"), "h")
  if (st === "denied") return add(body, await panel("denied", "لا يمكنك تعديل المنتجات الآن", "متجرك موقوف مؤقتًا. تواصل مع الدعم لإعادة التفعيل.", "تواصل مع الدعم"), "h")
  add(body, await fsec("المعلومات الأساسية", "اسم المنتج ووصفه كما يظهر للعميل.", async c => {
    add(c, await fld("اسم المنتج", v("ريب آي بقري طازج"), er ? "error" : S, er ? "اسم المنتج مطلوب" : "حتى 60 حرفًا"), "h")
    add(c, await fld("الوصف", v("قطعة ريب آي مرخّمة من لحم بقري طازج، تُقطَّع عند الطلب"), S, "حتى 300 حرف"), "h")
    add(c, await frow([await fld("التصنيف", v("الأبقار"), S, "يحدد مكان ظهور المنتج"), await fld("رمز المنتج (SKU)", v("RIB-001"), S, "لاستخدامك الداخلي")], 772), "h") }, er), "h")
  add(body, await fsec("الصور", "الصورة الأولى هي الغلاف. أضف حتى 6 صور بجودة عالية.", async c => {
    const g = frame("gallery", { dir: "HORIZONTAL", w: 772, gap: 12 })
    if (!e) { add(g, await photoBox("photo cover main", 240, 180, "ribeye-paper")); const sm = frame("thumbs", { gap: 12 }); for (const rw of [["steaks-dark", "steaks-garlic"], ["steaks-white", "tbone-pan"]]) { const r = frame("row", { dir: "HORIZONTAL", gap: 12 }); for (const k of rw) add(r, await photoBox("photo gallery " + k, 114, 84, k, "sm")); add(sm, r) } add(g, sm) }
    const u = frame("upload", { dir: "HORIZONTAL", w: e ? 772 : 240, h: 180, main: "CENTER", cross: "CENTER", gap: 8, fill: "bg", stroke: er ? "danger" : "line", r: "md" }); add(u, await icon("plus", 24, "ink-2")); add(u, await tx("إضافة صورة", "Label/M", "ink-2", "bg")); add(g, u); add(c, g, "h") }, er), "h")
  add(body, await fsec("الأحجام والأسعار", "كل حجم له سعر مستقل بالريال السعودي.", async c => {
    for (const [n, w, p, t] of e ? [] : [["صغير", "250 جم", "45.00", "success"], ["وسط", "500 جم", "89.00", "success"], ["كبير", "1 كجم", er ? "" : "170.00", "success"]]) { const r = frame("size", { dir: "HORIZONTAL", w: 772, gap: 12, cross: "CENTER" }); add(r, await box(n, 150)); add(r, await box(w, 150)); add(r, await box(p ? p + " ر.س" : "السعر مطلوب", 170, !p)); add(r, await bdg(t, "مفعّل")); add(c, r, "h") }
    add(c, await button("إضافة حجم", "secondary", "default", "S")) }, er), "h")
  add(body, await fsec("طرق التقطيع", "اختر التقطيعات التي يقدمها المتجر لهذا المنتج.", async c => { const r = frame("cuts", { dir: "HORIZONTAL", w: 772, gap: 8 }); r.layoutWrap = "WRAP"; for (const [i, t] of CUTS.entries()) add(r, await chip(t, !e && i < 4 ? "selected" : "default")); add(c, r, "h") }, false), "h")
  add(body, await fsec("التغليف", "خيارات التغليف وفرق السعر عن السعر الأساسي.", async c => { for (const [i, t] of ["كيس مفرغ · مجاني", "علبة مبرّدة · +3.00 ر.س", "كرتون مبرّد · +6.00 ر.س", "تغليف هدية · +10.00 ر.س"].entries()) { const k = inst("checkbox", { checked: !e && i < 3 ? "yes" : "no", state: "default" }); await retext(k, "إضافة تغليف هدية", t); add(c, k) } }, false), "h")
  add(body, await fsec("الاستثناءات", "ما يمكن للعميل أن يطلب حذفه من القطعة.", async c => { const r = frame("exclusions", { dir: "HORIZONTAL", gap: 8 }); for (const [i, t] of ["بدون دهون زائدة", "بدون عظم", "بدون جلد", "بدون غضاريف"].entries()) add(r, await chip(t, !e && i < 2 ? "selected" : "default")); add(c, r) }, false), "h")
  add(body, await fsec("مصفوفة التوافق", "حدّد أي تقطيع يصلح مع أي تغليف. 6 تقطيعات × 4 خيارات تغليف.", async c => add(c, await matrix(772), "h"), false), "h")
  add(body, await fsec("التجهيز والتوصيل", "كيف يصل هذا المنتج للعميل.", async c => {
    for (const [t, on] of [["التوصيل متاح", "yes"], ["الاستلام من المتجر", "yes"], ["يُذبح عند الطلب", "no"]]) { const s = inst("switch", { checked: e ? "no" : on, state: "default" }); await retext(s, "إضافة تغليف هدية", t); add(c, s) }
    add(c, await frow([await fld("مدة التجهيز", v("ساعتان"), S, "من لحظة تأكيد الطلب"), await fld("الحد الأدنى للكمية", v("1"), S, "بحسب وحدة الحجم")], 772), "h") }, false), "h")
  add(body, await fsec("التوفر", "أيام ظهور المنتج للطلب والكمية اليومية.", async c => {
    const s = inst("switch", { checked: e ? "no" : "yes", state: "default" }); await retext(s, "إضافة تغليف هدية", "متاح للطلب"); add(c, s)
    const d = frame("days", { dir: "HORIZONTAL", gap: 8 }); for (const [i, t] of ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].entries()) add(d, await chip(t, !e && i < 6 ? "selected" : "default")); add(c, d)
    add(c, await frow([await fld("الكمية اليومية", v("40 كجم"), S, "يتوقف الطلب عند نفادها"), await fld("إيقاف مؤقت حتى", null, "default", "اتركه فارغًا إن لم تحتج")], 772), "h") }, false), "h")
  add(body, await formActions(1132, "إرسال للمراجعة", "حفظ كمسودة", e), "h")
}
const pf = await dash("vendor", "Products/Form", "ريب آي بقري طازج", "منتجاتي / تعديل منتج", null)
await screenSection(ctx, P, "sec-vnd-product-form", "نموذج المنتج · Vendor product form", async S => {
  S.note = "تسع مجموعات: الأساسيات، الصور، الأحجام، التقطيع، التغليف، الاستثناءات، مصفوفة التوافق، التجهيز، التوفر. المصفوفة تُقرأ صفًا بصفًا وتتسع لـ 6 تقطيعات × 4 تغليفات دون تمرير أفقي."
  await variants(S, pf, formBody, [["empty", "Empty (new product)"], ["error", "Validation error"], ["loading", "Loading"], ["loadfail", "Error"], ["denied", "Permission denied"]])
})

// ---- Rejection feedback -------------------------------------------------------------------------------------------------
async function fbBody(body, st) {
  if (st === "loading") return skeletonBody(body, 1132, 4)
  if (st === "error") return add(body, await panel("error", "تعذّر تحميل ملاحظات المراجعة", "تحقق من اتصالك ثم أعد المحاولة.", "إعادة المحاولة"), "h")
  const k = { default: ["danger", "مرفوض"], pending: ["info", "قيد المراجعة"], approved: ["success", "منشور"] }[st], row = frame("layout", { dir: "HORIZONTAL", w: 1132, gap: 24, cross: "MIN" })
  const L = await card("ملاحظات فريق المراجعة", 748, { name: "feedback" }), top = frame("head", { dir: "HORIZONTAL", w: 700, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(top, await tx("فريق جزلة · 10 نوفمبر 2026 · 02:40 م", "Body/M", "ink-2", "paper")); add(top, await bdg(k[0], k[1], "M")); add(L, top, "h")
  if (st === "default") {
    add(L, await tx("لم نتمكن من نشر المنتج بسبب الملاحظات التالية. عدّلها ثم أعد الإرسال وسنراجعه خلال يوم عمل.", "Body/M", "ink", "paper", 700), "h")
    for (const [t, d, a] of [["صورة الغلاف غير واضحة", "الإضاءة ضعيفة ولا تظهر ألياف اللحم. التقط صورة بإضاءة طبيعية.", "تعديل الصور"], ["الوزن لا يطابق الوصف", "الوصف يذكر 500 جم والحجم الوسط 450 جم. وحّد القيمتين.", "تعديل الأحجام"], ["ادعاء غير مثبت في الوصف", "عبارة «أجود لحم في المملكة» تحتاج إلى مصدر أو يجب حذفها.", "تعديل الوصف"]]) {
      const r = frame("issue", { dir: "HORIZONTAL", w: 700, gap: 12, pad: 16, cross: "MIN", fill: "danger-bg", r: "md" }); add(r, await icon("warning-circle", 24, "danger", "fill"))
      const t2 = frame("text", { gap: 4 }); add(t2, await tx(t, "Label/M", "ink", "danger-bg", 480)); add(t2, await tx(d, "Body/M", "ink", "danger-bg", 480)); add(r, t2, "h"); add(r, await button(a, "secondary", "default", "S")); add(L, r, "h") }
    chk("issue icon", "danger", "danger-bg", 3)
  } else add(L, await note(st === "pending" ? "أُرسل المنتج للمراجعة بعد تعديل الملاحظات. سنخبرك بالقرار خلال يوم عمل." : "تمت الموافقة ونُشر المنتج في المتجر بعد تعديل الصور والوصف.", 700, st === "pending" ? "clock" : "check-circle", st === "pending" ? "sand" : "sand"), "h")
  if (st === "default") add(L, await btnRow([["تعديل وإعادة الإرسال", "primary"], ["حذف المنتج", "ghost"]], 460)); add(row, L)
  const R = await card("المنتج", 360, { name: "product" }); add(R, await photoBox("photo product cover", 312, 200, "ribeye-paper"), "h")
  add(R, await kv([["الاسم", "ريب آي بقري طازج"], ["التصنيف", "الأبقار"], ["السعر من", "45.00 ر.س"], ["محاولات الإرسال", st === "default" ? "1" : "2"]], 312), "h"); add(row, R); add(body, row)
}
const fbk = await dash("vendor", "Products/Rejection feedback", "ملاحظات المراجعة", "منتجاتي / ريب آي بقري طازج / ملاحظات", null)
await screenSection(ctx, P, "sec-vnd-product-feedback", "ملاحظات الرفض · Rejection feedback", async S => {
  S.note = "كل ملاحظة تقود مباشرة إلى القسم المعني في نموذج المنتج. بعد إعادة الإرسال يختفي زر التعديل حتى صدور القرار."
  await variants(S, fbk, fbBody, [["pending", "Resubmitted"], ["approved", "Approved"], ["loading", "Loading"], ["error", "Error"]])
})
chk("title", "ink", "bg"); chk("sub", "ink-2", "bg")
print("✅ VND product form + feedback done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
