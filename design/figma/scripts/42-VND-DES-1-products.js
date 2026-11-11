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
ctx.y = await startY(P, ["sec-vnd-categories", "sec-vnd-products-admin", "sec-vnd-review-queue"])
// generic non-data states for a list screen: returns true when handled
async function listState(body, st, o) {
  if (st === "denied") add(body, await panel("denied", o.deniedT, o.deniedB, "العودة للوحة المعلومات"), "h")
  else if (st === "error") add(body, await panel("error", o.errT, "حدث خطأ أثناء جلب البيانات. حاول مرة أخرى.", "إعادة المحاولة"), "h")
  else if (st === "empty") add(body, await panel(o.emptyKind || "search", o.emptyT, o.emptyB, o.emptyCta), "h")
  else return false
  return true
}

// ---- Categories ----------------------------------------------------------------------------------------------
const CC = [["التصنيف", 320], ["الرابط", 160], ["المنتجات", 110], ["الترتيب", 90], ["الحالة", 130], ["", 52]]
const CR = [["الأغنام", "sheep", "sheep", "148", "1"], ["الأبقار", "steaks-dark", "cattle", "96", "2"], ["الإبل", "camel", "camel", "34", "3"], ["الدواجن", "roast-paper", "poultry", "72", "4"], ["المفرومات", "strips", "minced", "41", "5"], ["المشويات", "bbq", "grills", "58", "6"], ["الولائم", "mandi", "feasts", "27", "7"]]
  .map(r => [{ ph: [r[1], r[0]] }, r[2], r[3], r[4], { b: [r[0] === "الإبل" ? "neutral" : "success", r[0] === "الإبل" ? "مخفي" : "ظاهر"] }, { ic: "dots-three" }])
async function catBody(body, st) {
  const o = { deniedT: "ليست لديك صلاحية لإدارة التصنيفات", deniedB: "إدارة التصنيفات متاحة لمدير الكتالوج فقط.", errT: "تعذّر تحميل التصنيفات", emptyT: "لا توجد تصنيفات بعد", emptyB: "أنشئ أول تصنيف ليتمكن البائعون من ربط منتجاتهم به.", emptyCta: "إضافة تصنيف", emptyKind: "orders" }
  if (await listState(body, st, o)) return
  add(body, await tableOf(CC, CR, 1132, { skel: st === "loading" }), "h")
}
const cb = await dash("admin", "Catalog/Categories", "التصنيفات", "الكتالوج / التصنيفات", ["إضافة تصنيف", "ترتيب التصنيفات"])
await screenSection(ctx, P, "sec-vnd-categories", "قائمة التصنيفات · Categories list", async S => {
  S.note = "الإخفاء لا يحذف المنتجات، يخفيها عن المتجر فقط. الترتيب يتحكم بظهور التصنيفات في الصفحة الرئيسية."
  await variants(S, cb, catBody, [["loading", "Loading"], ["empty", "Empty"], ["error", "Error"], ["denied", "Permission denied"]])
  const c = stateCopy(cb, "Edit dialog", true)
  await modal(c.screen, "تعديل تصنيف الأغنام", async d => {
    add(d, await photoBox("photo category cover", 472, 140, "sheep"), "h")
    add(d, await frow([await fld("اسم التصنيف", "الأغنام", "filled", "يظهر للعملاء"), await fld("الرابط", "sheep", "filled", "بالإنجليزية بدون مسافات")], 472), "h")
    const sw = inst("switch", { checked: "yes", state: "default" }); await retext(sw, "إضافة تغليف هدية", "ظاهر في المتجر"); add(d, sw)
    add(d, await btnRow([["حفظ", "primary"], ["إلغاء", "secondary"]], 472), "h") })
  S.states.push(c.screen)
})

// ---- Products (admin: all vendors) ------------------------------------------------------------------------------
const PC = [["المنتج", 300], ["المتجر", 160], ["التصنيف", 110], ["السعر من", 110], ["الحالة", 140], ["آخر تحديث", 130], ["", 52]]
const PR = [
  [{ ph: ["ribeye-paper", "ريب آي بقري طازج"] }, "مجازر الفلاح", "الأبقار", "89.00 ر.س", { b: ["success", "منشور"] }, "10 نوفمبر 2026", { ic: "dots-three" }],
  [{ ph: ["lamb-leg", "فخذ غنم نعيمي"] }, "ذبائح الرياض", "الأغنام", "165.00 ر.س", { b: ["info", "قيد المراجعة"] }, "11 نوفمبر 2026", { ic: "dots-three" }],
  [{ ph: ["mandi", "مندي لحم للولائم"] }, "ملحمة النخبة", "الولائم", "420.00 ر.س", { b: ["warning", "غير متاح"] }, "9 نوفمبر 2026", { ic: "dots-three" }],
  [{ ph: ["tbone-pan", "تي بون بقري"] }, "مجازر الفلاح", "الأبقار", "118.00 ر.س", { b: ["danger", "مرفوض"] }, "8 نوفمبر 2026", { ic: "dots-three" }],
  [{ ph: ["bbq", "ضلوع غنم للمشاوي"] }, "مزارع الواحة", "المشويات", "112.00 ر.س", { b: ["success", "منشور"] }, "7 نوفمبر 2026", { ic: "dots-three" }],
  [{ ph: ["strips", "لحم مفروم ناعم"] }, "ملحمة النخبة", "المفرومات", "74.00 ر.س", { b: ["neutral", "مسودة"] }, "6 نوفمبر 2026", { ic: "dots-three" }],
]
async function prodBody(body, st) {
  const f = st === "filtered"
  add(body, await fb("ابحث باسم المنتج أو المتجر", ["حالة المنتج", "المتجر", "التصنيف"], "آخر تحديث", f && { v: "قيد المراجعة", chips: ["الحالة: قيد المراجعة", "المتجر: ذبائح الرياض"] }), "h")
  if (await listState(body, st, { deniedT: "ليست لديك صلاحية لعرض المنتجات", deniedB: "اطلب صلاحية مدير الكتالوج من مدير المنصة.", errT: "تعذّر تحميل المنتجات", emptyT: "لا توجد منتجات مطابقة", emptyB: "لا يوجد منتج بهذه المرشحات، جرّب مسحها.", emptyCta: "مسح التصفية" })) return
  add(body, await tableOf(PC, f ? [PR[1]] : PR, 1132, { skel: st === "loading" }), "h")
}
const pb = await dash("admin", "Catalog/Products", "المنتجات", "الكتالوج / كل المنتجات", ["تصدير القائمة", null])
await screenSection(ctx, P, "sec-vnd-products-admin", "قائمة المنتجات (الإدارة) · Admin product list", async S => {
  S.note = "الإدارة ترى منتجات كل المتاجر. الإيقاف الإداري لمنتج يخفيه فورًا ويُشعَر البائع بالسبب."
  await variants(S, pb, prodBody, [["loading", "Loading"], ["empty", "Empty"], ["error", "Error"], ["denied", "Permission denied"], ["filtered", "Filtered"]])
})

// ---- Review queue -----------------------------------------------------------------------------------------------
const QC = [["المنتج", 300], ["المتجر", 160], ["نوع الطلب", 140], ["أُرسل", 140], ["الانتظار", 120], ["", 120]]
const QR = [
  [{ ph: ["lamb-leg", "فخذ غنم نعيمي"] }, "ذبائح الرياض", { b: ["neutral", "منتج جديد"] }, "11 نوفمبر 2026", "ساعتان", { btn: "مراجعة" }],
  [{ ph: ["steaks-garlic", "ستيك مخلّل بالثوم"] }, "مجازر الفلاح", { b: ["info", "تعديل صور"] }, "10 نوفمبر 2026", "يوم واحد", { btn: "مراجعة" }],
  [{ ph: ["roast-shoulder", "كتف غنم للتحمير"] }, "مزارع الواحة", { b: ["warning", "تعديل سعر"] }, "9 نوفمبر 2026", "يومان", { btn: "مراجعة" }],
  [{ ph: ["camel-saddle", "سنام ناقة طازج"] }, "لحوم تبوك", { b: ["neutral", "منتج جديد"] }, "8 نوفمبر 2026", "3 أيام", { btn: "مراجعة" }],
]
async function queueBody(body, st) {
  if (st !== "denied" && st !== "error") add(body, await tabs3(["قيد المراجعة", "معتمدة", "مرفوضة"], 1))
  if (await listState(body, st, { deniedT: "ليست لديك صلاحية لمراجعة المنتجات", deniedB: "مراجعة المنتجات متاحة لمشرفي الكتالوج.", errT: "تعذّر تحميل قائمة المراجعة", emptyKind: "orders", emptyT: "لا توجد منتجات بانتظار المراجعة", emptyB: "كل المنتجات المرسلة تمت مراجعتها. سنخبرك عند وصول طلب جديد.", emptyCta: "عرض المنتجات المعتمدة" })) return
  add(body, await tableOf(QC, QR, 1132, { skel: st === "loading", rowH: 72 }), "h")
}
const qb = await dash("admin", "Catalog/Review queue", "مراجعة المنتجات", "الكتالوج / طلبات المراجعة", null)
await screenSection(ctx, P, "sec-vnd-review-queue", "طابور مراجعة المنتجات · Product review queue", async S => {
  S.note = "أقدم طلب أولًا، ويُنبَّه المشرف عند تجاوز 48 ساعة. الرفض يتطلب سببًا يظهر للبائع في شاشة ملاحظات المراجعة."
  await variants(S, qb, queueBody, [["loading", "Loading"], ["empty", "Empty"], ["error", "Error"], ["denied", "Permission denied"]])
  const c = stateCopy(qb, "Review dialog", true)
  await modal(c.screen, "مراجعة: فخذ غنم نعيمي", async d => {
    const r = frame("summary", { dir: "HORIZONTAL", w: 632, gap: 16 }); add(r, await photoBox("photo product preview", 160, 160, "lamb-leg"))
    const k = frame("info", { w: 456 }); k.itemSpacing = 8; add(k, await kv([["المتجر", "ذبائح الرياض"], ["التصنيف", "الأغنام"], ["السعر من", "165.00 ر.س"], ["الأحجام", "نصف فخذ، فخذ كامل"], ["التغليف", "كيس مفرغ، علبة مبرّدة"]], 456), "h"); add(r, k, "h"); add(d, r, "h")
    const ch = frame("reasons", { dir: "HORIZONTAL", gap: 8, w: 632 }); for (const [i, t] of ["صورة غير واضحة", "وصف ناقص", "سعر غير منطقي"].entries()) add(ch, await chip(t, i === 0 ? "selected" : "default")); add(d, ch, "h")
    add(d, await fld("سبب الرفض (يظهر للبائع)", "صورة المنتج غير واضحة، التقط صورة بإضاءة أفضل", "filled", "جملة واحدة واضحة تكفي"), "h")
    add(d, await btnRow([["اعتماد ونشر", "primary"], ["رفض مع السبب", "danger"], ["إغلاق", "secondary"]], 632), "h") }, 680)
  S.states.push(c.screen)
})
chk("title", "ink", "bg"); chk("sub", "ink-2", "bg")
print("✅ VND admin catalog done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
