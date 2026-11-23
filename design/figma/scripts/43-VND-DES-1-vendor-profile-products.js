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
ctx.y = await startY(P, ["sec-vnd-store-profile", "sec-vnd-products-vendor"])

// ---- Store profile ----------------------------------------------------------------------------------------------
async function profileBody(body, st) {
  const f = st !== "empty", e = st === "error", off = st === "suspended", v = a => (f ? a : null), S = f ? (e ? "error" : "filled") : "default"
  if (st === "loading") return skeletonBody(body)
  if (st === "loadfail") return add(body, await panel("error", "تعذّر تحميل ملف المتجر", "تحقق من اتصالك ثم أعد المحاولة.", "إعادة المحاولة"), "h")
  if (off) add(body, await note("متجرك موقوف مؤقتًا بقرار من الإدارة، والبيانات للقراءة فقط. تواصل مع الدعم لإعادة التفعيل.", 1132, "lock-simple", "warning-bg"), "h")
  add(body, await fsec("هوية المتجر", "الاسم والوصف والصور كما تظهر للعملاء في صفحة المتجر.", async c => {
    const im = frame("images", { dir: "HORIZONTAL", w: 772, gap: 16 }); add(im, await photoBox("photo logo", 96, 96, "butchers", "pill")); add(im, await photoBox("photo cover", 660, 96, "cuts", "md")); add(c, im, "h")
    add(c, await frow([await fld("اسم المتجر", v("مجازر الفلاح"), e ? "error" : f ? "filled" : "default", e ? "اسم المتجر مطلوب، اكتبه كما في السجل" : "كما يظهر للعملاء"), await fld("شعار نصي قصير", v("لحم طازج كل يوم"), f ? "filled" : "default", "حتى 40 حرفًا")], 772), "h")
    add(c, await fld("وصف المتجر", v("مجزر عائلي في الرياض منذ 1998، نذبح يوميًا ونوصّل طازجًا"), f ? "filled" : "default", "يظهر في صفحة المتجر، حتى 200 حرف"), "h") }, false), "h")
  add(body, await fsec("بيانات التواصل", "يستخدمها فريق جزلة للتواصل معك، ولا تظهر للعملاء.", async c => {
    const p = inst("phone-input", { state: "default" }); await retext(p, "سنرسل لك رمز التحقق", "رقم مسؤول الطلبات"); if (f) phoneValue(p)
    add(c, await frow([p, await fld("البريد الإلكتروني", v("orders@alfalah-meat.sa"), e ? "error" : f ? "filled" : "default", e ? "صيغة البريد غير صحيحة" : "لإشعارات الطلبات")], 772), "h") }, e), "h")
  add(body, await fsec("الموقع", "عنوان الفرع الذي تخرج منه الطلبات ويستلم منه العملاء.", async c => {
    add(c, await mapBox(772, 200), "h"); add(c, await fld("العنوان", v("طريق الأمير سعد بن عبدالرحمن، حي النسيم، الرياض"), f ? "filled" : "default", "الشارع والحي والمدينة"), "h") }, false), "h")
  add(body, await fsec("ساعات العمل", "الأوقات التي تستقبل فيها الطلبات وتجهّزها.", async c => {
    for (const [t, on] of [["السبت إلى الخميس · 8:00 ص إلى 11:00 م", "yes"], ["الجمعة · 1:00 م إلى 11:00 م", "yes"], ["العطلات الرسمية", "no"]]) { const s = inst("switch", { checked: f ? on : "no", state: "default" }); await retext(s, "إضافة تغليف هدية", t); add(c, s) } }, false), "h")
  add(body, await fsec("الحساب البنكي", "يُحوَّل إليه صافي الأرباح أسبوعيًا. للتعديل تواصل مع الدعم.", async c => {
    add(c, await fld("رقم الآيبان", v("SA03 8000 0000 6080 1016 7519"), "disabled", "مرتبط بمصرف الراجحي، لا يمكن تعديله هنا"), "h") }, false), "h")
  add(body, await formActions(1132, "حفظ التغييرات", "تجاهل", true), "h")
}
const sp = await dash("vendor", "Store/Profile", "ملف المتجر", "الإعدادات / ملف المتجر", null)
await screenSection(ctx, P, "sec-vnd-store-profile", "ملف المتجر · Vendor store profile", async S => {
  S.note = "الحقول الحساسة (الآيبان، السجل التجاري) للقراءة فقط وتُعدَّل عبر الدعم. تعديل الاسم يمر بمراجعة قبل الظهور للعملاء."
  await variants(S, sp, profileBody, [["empty", "Empty"], ["error", "Validation error"], ["loading", "Loading"], ["loadfail", "Error"], ["suspended", "Permission denied (suspended)"]])
})

// ---- Vendor product list -------------------------------------------------------------------------------------------
const VPC = [["المنتج", 300], ["التصنيف", 110], ["السعر من", 110], ["التوفر", 120], ["الحالة", 140], ["آخر تحديث", 130], ["", 52]]
const VPR = [
  [{ ph: ["ribeye-paper", "ريب آي بقري طازج"] }, "الأبقار", "89.00 ر.س", { b: ["success", "متاح"] }, { b: ["success", "منشور"] }, "10 نوفمبر 2026", { ic: "dots-three" }],
  [{ ph: ["tbone-pan", "تي بون بقري"] }, "الأبقار", "118.00 ر.س", { b: ["neutral", "غير معروض"] }, { b: ["danger", "مرفوض"] }, "8 نوفمبر 2026", { ic: "dots-three" }],
  [{ ph: ["lamb-leg", "فخذ غنم نعيمي"] }, "الأغنام", "165.00 ر.س", { b: ["neutral", "غير معروض"] }, { b: ["info", "قيد المراجعة"] }, "11 نوفمبر 2026", { ic: "dots-three" }],
  [{ ph: ["steaks-garlic", "ستيك مخلّل بالثوم"] }, "الأبقار", "96.00 ر.س", { b: ["neutral", "غير معروض"] }, { b: ["neutral", "مسودة"] }, "6 نوفمبر 2026", { ic: "dots-three" }],
  [{ ph: ["chops-wood", "ضلوع غنم للمشاوي"] }, "المشويات", "112.00 ر.س", { b: ["warning", "نفد المخزون"] }, { b: ["success", "منشور"] }, "5 نوفمبر 2026", { ic: "dots-three" }],
]
async function vlistBody(body, st) {
  const f = st === "filtered", pnl = async (k, a, b, c) => add(body, await panel(k, a, b, c), "h")
  if (st === "denied") return pnl("denied", "متجرك قيد المراجعة", "ستتمكن من إضافة المنتجات فور اعتماد المتجر من الإدارة.", "عرض حالة الطلب")
  if (st === "empty") return pnl("orders", "لا توجد منتجات بعد", "أضف أول منتج وحدّد أحجامه وتقطيعه ليظهر للعملاء بعد المراجعة.", "إضافة أول منتج")
  if (st === "error") return pnl("error", "تعذّر تحميل منتجاتك", "حدث خطأ أثناء جلب القائمة. حاول مرة أخرى.", "إعادة المحاولة")
  if (st !== "loading") add(body, await note("منتجان مرفوضان بانتظار تعديلك. افتح المنتج لقراءة ملاحظات المراجعة.", 1132, "warning-circle", "warning-bg"), "h")
  add(body, await fb("ابحث باسم المنتج", ["حالة المنتج", "التصنيف", "التوفر"], "آخر تحديث", f && { v: "مرفوض", chips: ["الحالة: مرفوض", "التصنيف: الأبقار"] }), "h")
  add(body, await tableOf(VPC, f ? [VPR[1]] : VPR, 1132, { skel: st === "loading" }), "h")
}
const vl = await dash("vendor", "Products/List", "منتجاتي", "المنتجات / كل المنتجات", ["إضافة منتج", null])
await screenSection(ctx, P, "sec-vnd-products-vendor", "قائمة منتجاتي · Vendor product list", async S => {
  S.note = "كل تعديل جوهري على منتج منشور (اسم، صور، سعر) يعود إلى المراجعة، أما التوفر والمخزون فيتحدثان فورًا."
  await variants(S, vl, vlistBody, [["loading", "Loading"], ["empty", "Empty"], ["error", "Error"], ["denied", "Permission denied (store pending)"], ["filtered", "Filtered"]])
})
chk("title", "ink", "bg"); chk("sub", "ink-2", "bg")
print("✅ VND vendor profile + products done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
