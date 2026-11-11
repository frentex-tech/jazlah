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
async function note(text, w, icn = "info", fill = "info-bg") { const f = frame("notice", { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, cross: "CENTER", fill, r: "md" }); add(f, await icon(icn, 24, "ink")); add(f, await tx(text, "Body/M", "ink", fill, w - 76), "h"); return f }
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
ctx.y = await startY(P, ["sec-vnd-vendors", "sec-vnd-vendor-review"])

// ---- Vendor list -------------------------------------------------------------------------------------
const VC = [["المتجر", 300], ["المدينة", 130], ["الحالة", 150], ["تاريخ التقديم", 150], ["المنتجات", 90], ["العمولة", 90], ["", 52]]
const VR = [
  [{ ph: ["butchers", "مجازر الفلاح"] }, "الرياض", { b: ["success", "نشط"] }, "12 أكتوبر 2026", "48", "8%", { ic: "dots-three" }],
  [{ ph: ["cuts", "ملحمة النخبة"] }, "جدة", { b: ["info", "قيد المراجعة"] }, "9 نوفمبر 2026", "0", "غير محددة", { ic: "dots-three" }],
  [{ ph: ["sheep", "مزارع الواحة"] }, "الأحساء", { b: ["warning", "بانتظار مستندات"] }, "7 نوفمبر 2026", "0", "غير محددة", { ic: "dots-three" }],
  [{ ph: ["lamb-leg", "ذبائح الرياض"] }, "الرياض", { b: ["success", "نشط"] }, "28 سبتمبر 2026", "63", "7.5%", { ic: "dots-three" }],
  [{ ph: ["carcass", "أسواق الراعي"] }, "الدمام", { b: ["neutral", "موقوف"] }, "3 أغسطس 2026", "21", "9%", { ic: "dots-three" }],
  [{ ph: ["camel", "لحوم تبوك"] }, "تبوك", { b: ["danger", "مرفوض"] }, "2 نوفمبر 2026", "0", "غير محددة", { ic: "dots-three" }],
]
async function listBody(body, st) {
  const f = st === "filtered"
  add(body, await fb("ابحث باسم المتجر أو السجل التجاري", ["حالة المتجر", "المدينة", "التصنيف"], "تاريخ التقديم", f && { v: "قيد المراجعة", chips: ["الحالة: قيد المراجعة", "المدينة: جدة"] }), "h")
  if (st === "denied") return add(body, await panel("denied", "ليست لديك صلاحية لإدارة المتاجر", "هذه الصفحة متاحة لمدير المنصة ومسؤول الانضمام فقط.", "العودة للوحة المعلومات"), "h")
  add(body, await tabs3(["قيد المراجعة", "نشطة", "موقوفة"], f ? 1 : 2))
  if (st === "loading") return add(body, await tableOf(VC, VR, 1132, { skel: true }), "h")
  if (st === "error") return add(body, await panel("error", "تعذّر تحميل المتاجر", "حدث خطأ أثناء جلب القائمة. حاول مرة أخرى.", "إعادة المحاولة"), "h")
  if (st === "empty") return add(body, await panel("search", "لا توجد متاجر مطابقة", "لا توجد طلبات انضمام بهذه المرشحات. جرّب مسحها.", "مسح التصفية"), "h")
  add(body, await tableOf(VC, f ? [VR[1]] : VR), "h")
}
const vl = await dash("admin", "Vendors/List", "المتاجر", "المتاجر / كل المتاجر", ["دعوة بائع", "تصدير"])
await screenSection(ctx, P, "sec-vnd-vendors", "قائمة المتاجر · Admin vendor list", async S => {
  S.note = "الفرز الافتراضي: الأقدم أولًا في تبويب قيد المراجعة. العمولة تُحدَّد عند الاعتماد فقط."
  await variants(S, vl, listBody, [["loading", "Loading"], ["empty", "Empty"], ["error", "Error"], ["denied", "Permission denied"], ["filtered", "Filtered"]])
})

// ---- Review page ----------------------------------------------------------------------------------------
const DOCS = [["السجل التجاري", "cuts"], ["رخصة البلدية", "butchers"], ["الشهادة الصحية", "cuts"], ["الهوية الوطنية", "butchers"]]
async function reviewBody(body, st) {
  if (st === "loading") return skeletonBody(body)
  if (st === "error") return add(body, await panel("error", "تعذّر تحميل الطلب", "حدث خطأ أثناء جلب بيانات المتجر ومستنداته.", "إعادة المحاولة"), "h")
  if (st === "denied") return add(body, await panel("denied", "ليست لديك صلاحية لمراجعة الطلبات", "اطلب صلاحية مسؤول الانضمام من مدير المنصة.", "رجوع"), "h")
  const act = st === "active", row = frame("layout", { dir: "HORIZONTAL", w: 1132, gap: 24, cross: "MIN" })
  const L = frame("documents", { w: 748, gap: 24 }), dv = await card("المستندات", 748, { name: "document viewer card" })
  const ch = frame("doc chips", { dir: "HORIZONTAL", gap: 8 }); for (const [i, d] of DOCS.entries()) add(ch, await chip(d[0], i === 0 ? "selected" : "default")); add(dv, ch)
  add(dv, await photoBox("photo document viewer", 700, 380, "cuts", "md"), "h")
  const bar = frame("viewer bar", { dir: "HORIZONTAL", w: 700, main: "SPACE_BETWEEN", cross: "CENTER" })
  const tools = frame("tools", { dir: "HORIZONTAL", gap: 16 }); for (const n of ["magnifying-glass-plus", "magnifying-glass-minus", "arrows-clockwise", "download-simple"]) add(tools, await icon(n, 24, "ink")); add(bar, tools)
  add(bar, await tx("السجل التجاري · صفحة 1 من 2", "Body/M", "ink-2", "paper")); add(dv, bar, "h")
  add(dv, await btnRow([["المستند مطابق", "secondary", act ? "disabled" : "default"], ["طلب إعادة رفع", "ghost"]], 400)); add(L, dv, "h")
  const ph = await card("صور المتجر", 748, { name: "store photos" }), g = frame("gallery", { dir: "HORIZONTAL", w: 700, gap: 16 })
  for (const [n, k] of [["واجهة", "butchers"], ["الداخل", "cuts"], ["المنتجات", "steaks-dark"]]) add(g, await photoBox("photo gallery " + n, 223, 150, k)); add(ph, g, "h"); add(L, ph, "h"); add(row, L)
  const R = frame("aside", { w: 360, gap: 24 }), sm = await card("بيانات المتجر", 360, { name: "summary" })
  add(sm, await kv([["المتجر", "ملحمة النخبة"], ["النشاط", "ملحمة ومجزر"], ["السجل التجاري", "4030521187"], ["الرقم الضريبي", "300198765400003"], ["المسؤول", "فهد القحطاني"], ["الجوال", "⁦+966 54 331 2290⁩"], ["الآيبان", "SA44 2000 0001 2345 6789 1234"]], 312), "h"); add(R, sm, "h")
  const lc = await card("الموقع", 360, { name: "location" }); add(lc, await mapBox(312, 150), "h"); add(lc, await tx("حي الشاطئ، شارع الأمير ماجد، جدة", "Body/M", "ink-2", "paper", 312), "h"); add(R, lc, "h")
  const dc = await card(act ? "المتجر نشط" : "قرار المراجعة", 360, { name: "decision" })
  if (act) { add(dc, await kv([["الحالة", "نشط منذ 11 نوفمبر 2026"], ["العمولة", "8%"]], 312), "h"); add(dc, await button("إيقاف المتجر", "danger"), "h") }
  else { for (const t of ["السجل التجاري سارٍ", "المستندات مطابقة", "الموقع مطابق للصور"]) { const c = inst("checkbox", { checked: "yes", state: "default" }); await retext(c, "إضافة تغليف هدية", t); add(dc, c) }
    add(dc, await button("اعتماد المتجر", "primary"), "h"); add(dc, await button("رفض الطلب", "secondary"), "h") }
  add(R, dc, "h"); add(row, R); add(body, row)
}
const rv = await dash("admin", "Vendors/Review", "مراجعة: ملحمة النخبة", "المتاجر / طلبات الانضمام / ملحمة النخبة", null, 1500)
await screenSection(ctx, P, "sec-vnd-vendor-review", "مراجعة المتجر · Vendor review", async S => {
  S.note = "العرض الأيمن مستعرض مستندات بأربع علامات. الاعتماد يتطلب نسبة عمولة، والرفض يتطلب سببًا يصل إلى البائع، والإيقاف يتطلب سببًا ويُسجَّل في سجل التدقيق."
  await variants(S, rv, reviewBody, [["loading", "Loading"], ["error", "Error"], ["denied", "Permission denied"], ["active", "Approved"]])
  const copy = async (label, title, build, w) => { const c = stateCopy(rv, label, true); await modal(c.screen, title, build, w); S.states.push(c.screen) }
  await copy("Approve dialog", "اعتماد ملحمة النخبة", async d => {
    add(d, await tx("حدّد نسبة عمولة المنصة على كل طلب لهذا المتجر.", "Body/M", "ink-2", "paper", 472), "h")
    add(d, await fld("نسبة العمولة (%)", "8", "filled", "من 0 إلى 30 بالمئة من قيمة الطلب"), "h")
    add(d, await btnRow([["اعتماد وتفعيل", "primary"], ["إلغاء", "secondary"]], 472), "h") })
  await copy("Reject dialog", "رفض الطلب", async d => {
    add(d, await tx("سيصل السبب إلى البائع مع إمكانية تعديل الطلب وإعادة التقديم.", "Body/M", "ink-2", "paper", 472), "h")
    const ch = frame("reasons", { dir: "HORIZONTAL", gap: 8, w: 472 }); ch.layoutWrap = "WRAP"; for (const [i, t] of ["مستند منتهي", "صور غير واضحة", "بيانات غير مطابقة"].entries()) add(ch, await chip(t, i === 0 ? "selected" : "default")); add(d, ch, "h")
    add(d, await fld("سبب الرفض", "رخصة البلدية منتهية منذ 3 أشهر، ارفع رخصة سارية", "filled", "يظهر للبائع كما هو"), "h")
    add(d, await btnRow([["تأكيد الرفض", "danger"], ["إلغاء", "secondary"]], 472), "h") })
  // suspend acts on the approved (active) view
  const ac = S.states.find(s => s.name.endsWith("Approved")); const c2 = ac.clone(); c2.name = c2.name.replace("Approved", "Suspend dialog")
  await modal(c2, "إيقاف المتجر", async d => {
    add(d, await tx("لن يظهر المتجر ومنتجاته للعملاء، وتكمل الطلبات الجارية.", "Body/M", "ink-2", "paper", 472), "h")
    add(d, await fld("سبب الإيقاف", "تكرار شكاوى جودة التغليف خلال أكتوبر", "filled", "يُسجَّل في سجل التدقيق ويصل للبائع"), "h")
    add(d, await btnRow([["إيقاف المتجر", "danger"], ["إلغاء", "secondary"]], 472), "h") }, 520)
  S.states.push(c2)
})
chk("title", "ink", "bg"); chk("sub", "ink-2", "bg")
print("✅ VND admin vendors done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
