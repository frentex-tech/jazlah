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
const P = "20 Customer Web"
ctx.y = await startY(P, ["sec-vnd-apply", "sec-vnd-status"])

// ---- shared bits ------------------------------------------------------------------------------
const STEPS = ["بيانات المنشأة", "المستندات", "الحساب البنكي", "الموقع", "الصور"]
async function stepper(n, w = 1200) {
  const r = frame("stepper", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN", cross: "CENTER", pad: 0 })
  for (const [i, t] of STEPS.entries()) {
    const done = i + 1 < n, on = i + 1 === n, it = frame("step", { dir: "HORIZONTAL", gap: 12, cross: "CENTER" })
    const c = frame("dot", { dir: "HORIZONTAL", w: 40, h: 40, main: "CENTER", cross: "CENTER", fill: done ? "brand" : on ? "ember" : "sand", r: "pill" })
    add(c, done ? await icon("check", 20, "paper") : await tx(String(i + 1), "Label/M", on ? "paper" : "ink-2", on ? "ember" : "sand")); add(it, c)
    add(it, await tx(t, "Label/M", on ? "ink" : "ink-2", "bg")); add(r, it)
  }
  chk("step check", "paper", "brand", 3); return r
}
async function docRow(title, desc, file, st, key) {
  const r = frame("document", { dir: "HORIZONTAL", w: 752, gap: 16, pad: 16, cross: "CENTER", fill: "bg", stroke: st === "error" ? "danger" : "line", r: "md" })
  if (file) add(r, await photoBox("photo document thumb", 72, 72, key, "sm")); else { const u = frame("upload", { dir: "HORIZONTAL", w: 72, h: 72, main: "CENTER", cross: "CENTER", fill: "sand", r: "sm" }); add(u, await icon("upload-simple", 28, "ink-2")); add(r, u) }
  const i = frame("info", { gap: 4 }); add(i, await tx(title, "Label/M", "ink", "bg", 380)); add(i, await tx(st === "error" ? "الملف أكبر من 5 م.ب، اختر ملفًا أصغر" : file || desc, "Body/M", st === "error" ? "danger" : "ink-2", "bg", 380)); add(r, i, "h")
  add(r, st === "error" ? await button("إعادة الرفع", "secondary", "default", "S") : file ? await bdg("success", "تم الرفع") : await button("رفع ملف", "secondary", "default", "S")); return r
}
async function applyBody(body, n, st) {
  const f = st === "filled", e = st === "error", ld = st === "loading"
  add(body, await titleBlock("انضم كبائع في جزلة", `الخطوة ${n} من 5 · ${STEPS[n - 1]}`, "RIGHT", 1200), "h")
  add(body, await stepper(n), "h")
  const row = frame("layout", { dir: "HORIZONTAL", w: 1200, gap: 40, cross: "MIN" }), c = await card(null, 800, { name: "form card" }); c.itemSpacing = 20
  const v = (a, b) => (f || ld ? a : null)
  if (n === 1) {
    add(c, await frow([await fld("اسم المتجر التجاري", v("مجازر الفلاح"), f ? "filled" : e ? "error" : "default", e ? "اسم المتجر مطلوب" : "كما سيظهر للعملاء"), await fld("نوع النشاط", v("مجزر ومتجر لحوم"), f ? "filled" : "default", "مجزر، ملحمة أو مزرعة")]))
    add(c, await frow([await fld("رقم السجل التجاري", v("1010458231"), f ? "filled" : e ? "error" : "default", e ? "رقم السجل يتكوّن من 10 أرقام" : "10 أرقام"), await fld("الرقم الضريبي", v("310245987600003"), f ? "filled" : "default", "15 رقمًا يبدأ بـ 3")]))
    add(c, await frow([await fld("اسم المسؤول", v("عبدالله الفلاح"), f ? "filled" : "default", "كما في الهوية الوطنية"), await fld("البريد الإلكتروني", v("info@alfalah-meat.sa"), f ? "filled" : "default", "لإرسال قرار المراجعة")]))
    const p = inst("phone-input", { state: e ? "error" : "default" }); await retext(p, e ? "رقم الجوال غير مكتمل" : "سنرسل لك رمز التحقق", e ? "أدخل رقم جوال سعودي مكوّن من 9 أرقام" : "لتواصل فريق المراجعة معك"); if (f) phoneValue(p); add(c, p, "h")
  }
  if (n === 2) {
    const D = [["السجل التجاري", "PDF أو صورة، حتى 5 م.ب", "commercial-register.pdf · 1.2 م.ب", "cuts"], ["رخصة البلدية", "رخصة مزاولة نشاط سارية", "baladiya-license.jpg · 2.4 م.ب", "butchers"], ["شهادة الصحة / الذبح", "من وزارة البيئة أو البلدية", "health-cert.pdf · 0.9 م.ب", "cuts"], ["الهوية الوطنية للمسؤول", "صورة واضحة للوجهين", "national-id.jpg · 1.7 م.ب", "butchers"]]
    for (const [i, d] of D.entries()) add(c, await docRow(d[0], d[1], f || (e && i !== 1) ? d[2] : null, e && i === 1 ? "error" : "default", d[3]), "h")
  }
  if (n === 3) {
    add(c, await fld("رقم الآيبان (IBAN)", v("SA03 8000 0000 6080 1016 7519"), f ? "filled" : e ? "error" : "default", e ? "الآيبان غير صحيح، يجب أن يبدأ بـ SA ويتكوّن من 24 خانة" : "يبدأ بـ SA ويتكوّن من 24 خانة"), "h")
    add(c, await frow([await fld("اسم البنك", v("مصرف الراجحي"), f ? "filled" : "default", "يُحدَّد تلقائيًا من الآيبان"), await fld("اسم صاحب الحساب", v("مؤسسة الفلاح للحوم"), f ? "filled" : "default", "مطابق للسجل التجاري")]))
    add(c, await note("تُحوَّل أرباحك إلى هذا الحساب أسبوعيًا. يجب أن يكون الحساب باسم المنشأة.", 752, "bank"), "h")
  }
  if (n === 4) {
    add(c, await mapBox(752, 240), "h")
    add(c, await frow([await fld("المدينة", v("الرياض"), f ? "filled" : "default", "مدينة المتجر"), await fld("الحي", v("حي النسيم"), f ? "filled" : "default", "اسم الحي")]))
    add(c, await fld("العنوان التفصيلي", v("طريق الأمير سعد بن عبدالرحمن، مبنى 4125"), f ? "filled" : "default", "الشارع ورقم المبنى"), "h")
    const ck = inst("checkbox", { checked: f ? "yes" : "no", state: "default" }); await retext(ck, "إضافة تغليف هدية", "يستقبل المتجر طلبات الاستلام من الفرع"); add(c, ck)
  }
  if (n === 5) {
    add(c, await tx("أضف صورًا واضحة لواجهة المتجر ومنتجاتك (حتى 6 صور، كل صورة حتى 5 م.ب).", "Body/M", "ink-2", "paper", 752), "h")
    const g = frame("gallery", { dir: "HORIZONTAL", w: 752, gap: 16 })
    for (const [i, k] of ["butchers", "cuts", "steaks-dark"].entries()) if (f || ld) add(g, await photoBox(["photo gallery storefront", "photo gallery counter", "photo gallery products"][i], 232, 168, k))
    const u = frame("upload", { dir: "HORIZONTAL", w: f || ld ? 232 : 752, h: 168, main: "CENTER", cross: "CENTER", gap: 8, fill: "bg", stroke: "line", r: "md" }); add(u, await icon("plus", 24, "ink-2")); add(u, await tx("إضافة صورة", "Label/M", "ink-2", "bg")); add(g, u); add(c, g, "h")
  }
  add(c, await btnRow([[n === 5 ? "إرسال الطلب" : "التالي", "primary", ld ? "loading" : "default"], ...(n > 1 ? [["السابق", "secondary", ld ? "disabled" : "default"]] : [])], 752), "h")
  add(row, c)
  const a = await card("قبل أن تبدأ", 360, { name: "aside" })
  for (const t of ["سجل تجاري ساري", "رخصة البلدية والشهادة الصحية", "آيبان باسم المنشأة", "صور واضحة للمتجر"]) { const r = frame("item", { dir: "HORIZONTAL", gap: 12, cross: "CENTER" }); add(r, await icon("check-circle", 22, "success", "fill")); add(r, await tx(t, "Body/M", "ink", "paper", 280)); add(a, r, "h") }
  add(a, await note("تستغرق المراجعة من 2 إلى 3 أيام عمل، وسنرسل القرار على جوالك.", 312, "clock", "warning-bg"), "h"); add(row, a)
  add(body, row)
  if (ld) add(body, await tx("جارٍ إرسال الطلب…", "Body/M", "ink-2", "bg"))
}
const mk = async (path, state) => webScreen({ path, state, active: 3 })
const steps = []
for (let n = 1; n <= 5; n++) { const b = await mk(`Vendors/Apply/Step ${n}`, "Default"); await applyBody(b.body, n, "default"); steps.push(b) }
await screenSection(ctx, P, "sec-vnd-apply", "تقديم طلب بائع · Vendor apply (5 steps)", async S => {
  S.note = "نموذج متعدد الخطوات، حفظ تلقائي كمسودة بعد كل خطوة. الأخطاء تظهر تحت الحقل وتمنع الانتقال للخطوة التالية. حدود الملفات: 5 م.ب."
  steps.forEach(s => S.main.push(s.screen))
  for (const [n, st, label] of [[1, "filled", "Filled"], [1, "error", "Error"], [2, "filled", "Filled"], [2, "error", "Error"], [3, "error", "Error"], [4, "filled", "Filled"], [5, "filled", "Filled"], [5, "loading", "Loading"]]) { const c = stateCopy(steps[n - 1], label); await applyBody(c.body, n, st); S.states.push(c.screen) }
  const ok = stateCopy(steps[0], "Submitted"); add(ok.body, await panel("orders", "تم استلام طلبك", "سنراجع بياناتك خلال 2 إلى 3 أيام عمل ونرسل القرار على جوالك +966 55 123 4567.", "متابعة حالة الطلب", 1200, 420), "h"); S.states.push(ok.screen)
})

// ---- Application status ---------------------------------------------------------------------------
const TL = { review: [["done", "تم استلام الطلب", "تم استلام بياناتك ومستنداتك بنجاح", "9 نوفمبر 2026 · 10:42 ص"], ["now", "قيد المراجعة", "يراجع فريق الجودة المستندات والصور", "جارٍ الآن"], ["todo", "التحقق من الموقع", "اتصال هاتفي أو زيارة ميدانية عند الحاجة", ""], ["todo", "القرار النهائي", "اعتماد المتجر وتحديد نسبة العمولة", ""]],
  ok: [["done", "تم استلام الطلب", "تم استلام بياناتك ومستنداتك بنجاح", "9 نوفمبر 2026 · 10:42 ص"], ["done", "اكتملت المراجعة", "تم التحقق من المستندات والصور", "10 نوفمبر 2026 · 01:15 م"], ["done", "التحقق من الموقع", "تم التأكد من عنوان المتجر", "10 نوفمبر 2026 · 03:30 م"], ["done", "تم اعتماد متجرك", "عمولة المنصة 8% من قيمة كل طلب", "11 نوفمبر 2026 · 09:05 ص"]],
  no: [["done", "تم استلام الطلب", "تم استلام بياناتك ومستنداتك بنجاح", "9 نوفمبر 2026 · 10:42 ص"], ["done", "اكتملت المراجعة", "تمت مراجعة المستندات والصور", "10 نوفمبر 2026 · 01:15 م"], ["bad", "لم يُعتمد الطلب", "رخصة البلدية منتهية، ارفع رخصة سارية وأعد التقديم", "10 نوفمبر 2026 · 03:30 م"]] }
async function statusBody(body, k) {
  const badge = { review: ["info", "قيد المراجعة"], ok: ["success", "تم الاعتماد"], no: ["danger", "مرفوض"] }[k]
  const head = frame("head", { dir: "HORIZONTAL", w: 1200, main: "SPACE_BETWEEN", cross: "CENTER" }); add(head, await titleBlock("حالة طلب الانضمام", "رقم الطلب VND-2026-0418 · ملحمة النخبة", "RIGHT", 700)); add(head, await bdg(badge[0], badge[1], "M")); add(body, head, "h")
  const row = frame("layout", { dir: "HORIZONTAL", w: 1200, gap: 40, cross: "MIN" }), c = await card("مراحل الطلب", 760, { name: "timeline card" }); c.itemSpacing = 24
  for (const [s, t, d, tm] of TL[k]) {
    const r = frame("stage", { dir: "HORIZONTAL", w: 712, gap: 16, cross: "MIN" })
    const dot = frame("dot", { dir: "HORIZONTAL", w: 40, h: 40, main: "CENTER", cross: "CENTER", fill: s === "done" ? "brand" : s === "now" ? "ember" : s === "bad" ? "danger" : "sand", r: "pill" })
    add(dot, await icon(s === "done" ? "check" : s === "now" ? "hourglass-medium" : s === "bad" ? "x" : "circle", 20, s === "todo" ? "ink-2" : "paper")); add(r, dot)
    const i = frame("text", { gap: 4 }); add(i, await tx(t, "Label/M", s === "todo" ? "ink-2" : "ink", "paper", 520)); add(i, await tx(d, "Body/M", "ink-2", "paper", 520)); if (tm) add(i, await tx(tm, "Body/M", "ink-2", "paper", 520)); add(r, i, "h"); add(c, r, "h")
  }
  chk("timeline dot", "paper", "danger", 3); chk("timeline dot ember", "paper", "ember", 3)
  if (k === "no") add(c, await note("بعد تحديث رخصة البلدية يمكنك إعادة التقديم، وسنراجع الطلب خلال يومي عمل.", 712, "warning", "warning-bg"), "h")
  add(c, await button(k === "ok" ? "الدخول إلى لوحة البائع" : k === "no" ? "تعديل الطلب وإعادة التقديم" : "تواصل مع الدعم", k === "review" ? "secondary" : "primary"), "h"); add(row, c)
  const a = await card("ملخص الطلب", 400, { name: "summary" })
  add(a, await kv([["اسم المتجر", "ملحمة النخبة"], ["المدينة", "جدة"], ["السجل التجاري", "4030521187"], ["تاريخ التقديم", "9 نوفمبر 2026"], ["الجوال", "⁦+966 55 123 4567⁩"]], 352), "h"); add(row, a); add(body, row)
}
const stB = await webScreen({ path: "Vendors/Application status", state: "Under review", active: 3 }); await statusBody(stB.body, "review")
await screenSection(ctx, P, "sec-vnd-status", "حالة الطلب · Application status", async S => {
  S.note = "صفحة عامة يصل إليها المتقدّم من رابط الرسالة النصية. تتحدّث الحالة دون إعادة تحميل."
  S.main.push(stB.screen)
  for (const [k, l] of [["ok", "Approved"], ["no", "Rejected"]]) { const c = stateCopy(stB, l); await statusBody(c.body, k); S.states.push(c.screen) }
  const ld = stateCopy(stB, "Loading"); add(ld.body, await titleBlock("حالة طلب الانضمام", "جارٍ تحميل حالة الطلب", "RIGHT", 700), "h"); await skeletonBody(ld.body, 1200, 4); S.states.push(ld.screen)
  const em = stateCopy(stB, "Empty"); add(em.body, await panel("orders", "لا يوجد طلب انضمام بهذا الرقم", "تأكد من الرابط في الرسالة أو قدّم طلبًا جديدًا.", "قدّم طلبًا جديدًا", 1200, 420), "h"); S.states.push(em.screen)
  const er = stateCopy(stB, "Error"); add(er.body, await panel("error", "تعذّر تحميل حالة الطلب", "تحقق من اتصالك ثم أعد المحاولة.", "إعادة المحاولة", 1200, 420), "h"); S.states.push(er.screen)
})
chk("title", "ink", "bg"); chk("sub", "ink-2", "bg")
print("✅ VND apply + status done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
