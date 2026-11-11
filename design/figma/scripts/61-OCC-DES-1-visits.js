// OCC-DES-1 (2/4): visit booking, booking detail with map, "my animals" with deposit and scheduling. Mobile on page 10, web (booking, detail) on page 20.
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
const PM = "10 Customer App", PW = "20 Customer Web"
const OWN_M = ["sec-occ-visit-book", "sec-occ-visit-detail", "sec-occ-animals", "sec-occ-animal-detail"], OWN_W = ["sec-occ-visit-book-web", "sec-occ-visit-detail-web"]
const FARM = ["مزرعة الوادي الأخضر", "الخرج، طريق الرياض - الخرج، بعد جسر النعيرية"]
async function farmCard(w) {
  return box(w, async (c, iw) => {
    const r = frame("farm", { dir: "HORIZONTAL", w: iw, gap: 12, cross: "CENTER" }); add(r, await photo(72, 72, "sheep", "thumb"))
    const t = frame("t", { gap: 4, w: iw - 84 }); add(t, await T(FARM[0], "Label/M", "ink", iw - 84), "h"); add(t, await T(FARM[1], "Body/M", "ink-2", iw - 84), "h")
    const s = frame("rating", { dir: "HORIZONTAL", gap: 4, cross: "CENTER" }); add(s, await icon("star", 16, "gold-text", "fill")); add(s, await T("4.8 · مزرعة معتمدة", "Body/M", "ink")); add(t, s); chk("rating icon", "gold-text", "paper", 3)
    add(r, t); add(c, r, "h")
  })
}
// ---- 1. visit booking -------------------------------------------------------------------------------
async function bookBody(b, st, w = W) {
  const ok = st === "Filled", full = st === "Day full"
  add(b, await farmCard(w), "h")
  add(b, await T("يوم الزيارة", "Label/M", "ink", w), "h"); add(b, await strip(ok ? 19 : 0, ["avail", "avail", full ? "full" : "avail", "avail", "closed"]))
  add(b, await T("وقت الزيارة", "Label/M", "ink", w), "h")
  const cr = frame("times", { dir: "HORIZONTAL", gap: 8 }); for (const t of ["8:00 ص", "10:00 ص", "4:00 م"]) add(cr, await chip(t, ok && t === "10:00 ص" ? "selected" : full ? "disabled" : "default")); add(b, cr)
  const g = frame("visitors", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN", cross: "CENTER" }); add(g, await T("عدد الزوار", "Label/M", "ink")); const sp = inst("stepper", { state: ok ? "default" : "min" }); await retext(sp, ok ? "2" : "1", ok ? "3" : "1"); add(g, sp); add(b, g, "h")
  add(b, full ? await note(w, "warning", "اكتملت مواعيد هذا اليوم", "اختر يومًا آخر من التقويم أعلاه.") : await note(w, "info", "رسوم الزيارة 50.00 ر.س", "تُخصم من ثمن أي ذبيحة تحجزها خلال الزيارة."), "h")
}
const f1 = await family({ path: "Visits/Booking", header: { type: "page", title: "حجز زيارة" }, cta: "تأكيد الحجز", states: ["Filled", "Day full", "Loading", "Empty", "Error"],
  empty: ["calendar-x", "لا توجد مواعيد متاحة", "لا تتوفر زيارات هذا الأسبوع، جرّب مزرعة أخرى.", "تصفّح المزارع"], err: ["تعذّر تحميل المواعيد", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  await bookBody(b, st); await cta(b, "تأكيد الحجز", st === "Filled" ? "default" : "disabled")
})
// ---- 2. booking detail with map ---------------------------------------------------------------------
async function detailBody(b, st, w = W) {
  const x = st === "Cancelled"
  add(b, await box(w, async (c, iw) => {
    const h = frame("head", { dir: "HORIZONTAL", w: iw, main: "SPACE_BETWEEN", cross: "CENTER" }); add(h, await T("حجز رقم VS-4821", "Label/M", "ink")); add(h, await pill(x ? "ملغي" : "مؤكد", x ? "danger" : "success")); add(c, h, "h")
    add(c, await map(iw, 168), "h")
    add(c, await T(FARM[0], "Label/M", "ink", iw), "h"); add(c, await T(FARM[1], "Body/M", "ink-2", iw), "h")
    for (const [k, v] of [["اليوم", "الخميس 19 نوفمبر 2026"], ["الوقت", "10:00 صباحًا بتوقيت الرياض"], ["الزوار", "3 أشخاص"], ["رسوم الزيارة", "50.00 ر.س"]]) add(c, await kv(iw, k, v), "h")
  }), "h")
  if (x) add(b, await note(w, "danger", "تم إلغاء الحجز", "أُعيد مبلغ 50.00 ر.س إلى بطاقتك خلال 3 أيام عمل."), "h")
  else add(b, await note(w, "info", "تعليمات الوصول", "البوابة الخضراء بعد محطة الوقود. اتصل بالمشرف عند الوصول."), "h")
  add(b, await button("فتح الموقع في الخرائط", "secondary", x ? "disabled" : "default"), "h")
}
const f2 = await family({ path: "Visits/Detail", header: { type: "page", title: "تفاصيل الحجز" }, cta: "اتصال بالمزرعة", states: ["Cancelled", "Loading", "Error"], err: ["تعذّر تحميل الحجز", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  await detailBody(b, st); await cta(b, "اتصال بالمزرعة", st === "Cancelled" ? "disabled" : "default", st === "Cancelled" ? null : "إلغاء الحجز")
})
// ---- 3. my animals ----------------------------------------------------------------------------------
const ANIMALS = [["خروف نعيمي · 0142", "48 كجم · عمر 9 أشهر", "1,350.00 ر.س", "عربون مدفوع", "success", "sheep"], ["حاشي صغير · 0027", "210 كجم · عمر 14 شهرًا", "9,500.00 ر.س", "عربون مستحق", "warning", "camel-calf"], ["خروف حري · 0088", "55 كجم · عمر 11 شهرًا", "1,650.00 ر.س", "مجدول: 20 نوفمبر", "info", "sheep"]]
async function animalCard(w, a) {
  return box(w, async (c, iw) => {
    const r = frame("animal", { dir: "HORIZONTAL", w: iw, gap: 12, cross: "CENTER" }); add(r, await photo(72, 72, a[5], "thumb"))
    const t = frame("t", { gap: 4, w: iw - 84 }); add(t, await T(a[0], "Label/M", "ink", iw - 84), "h"); add(t, await T(a[1], "Body/M", "ink-2", iw - 84), "h"); add(t, await T(a[2], "Label/M", "ink", iw - 84), "h"); add(t, await pill(a[3], a[4])); add(r, t); add(c, r, "h")
  })
}
const f3 = await family({ path: "Animals/List", header: { type: "page", title: "مواشيّ" }, tab: "3", cta: "حجز زيارة", states: ["Loading", "Empty", "Error"],
  empty: ["paw-print", "لا توجد مواشٍ بعد", "بعد زيارة المزرعة واختيار ذبيحتك ستظهر هنا مع العربون والموعد.", "احجز زيارة"], err: ["تعذّر تحميل مواشيك", "تحقق من الاتصال ثم أعد المحاولة."] }, async b => { for (const a of ANIMALS) add(b, await animalCard(W, a), "h") })
// ---- 4. animal detail: deposit + scheduling ---------------------------------------------------------
async function animalBody(b, st, w = W) {
  const paid = st !== "Default", done = st === "Scheduled"
  add(b, await photo(w, 168, "sheep", "gallery", "md"), "h")
  add(b, await box(w, async (c, iw) => { add(c, await T("خروف نعيمي · 0142", "Heading/H3", "ink", iw), "h"); for (const [k, v] of [["الوزن", "48 كجم"], ["العمر", "9 أشهر"], ["السعر", "1,350.00 ر.س"], ["العربون (20%)", paid ? "270.00 ر.س · مدفوع" : "270.00 ر.س · مستحق"]]) add(c, await kv(iw, k, v), "h") }), "h")
  add(b, await T("موعد الذبح", "Label/M", "ink", w), "h"); add(b, await strip(done ? 20 : paid ? 21 : 0, paid ? undefined : ["closed", "closed", "closed", "closed", "closed"]))
  add(b, paid ? await note(w, done ? "success" : "info", done ? "الذبح الجمعة 20 نوفمبر" : "اختر يوم الذبح", done ? "نخبرك قبل الموعد بساعتين." : "يمكن التغيير حتى 48 ساعة قبل الموعد.") : await note(w, "warning", "ادفع العربون لفتح المواعيد", "يُحجز الحيوان لك مدة 24 ساعة."), "h")
}
const f4 = await family({ path: "Animals/Detail", header: { type: "page", title: "تفاصيل الحيوان" }, cta: "ادفع العربون 270.00 ر.س", states: ["Deposit paid", "Scheduled", "Loading", "Error"], err: ["تعذّر تحميل البيانات", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  await animalBody(b, st); await cta(b, st === "Default" ? "ادفع العربون 270.00 ر.س" : st === "Scheduled" ? "تم تأكيد الموعد" : "تأكيد موعد الذبح", st === "Scheduled" ? "disabled" : "default")
})
ctx.y = await yOf(PM, OWN_M)
await sec(PM, "sec-occ-visit-book", "حجز زيارة · Visit booking", [f1], "رسوم الزيارة 50.00 ر.س تُخصم من ثمن الذبيحة. الأيام المكتملة معطّلة مع سبب.")
await sec(PM, "sec-occ-visit-detail", "تفاصيل حجز الزيارة والخريطة · Visit booking detail", [f2])
await sec(PM, "sec-occ-animals", "مواشيّ · My animals", [f3])
await sec(PM, "sec-occ-animal-detail", "تفاصيل الحيوان: العربون والموعد · Animal deposit and scheduling", [f4], "المواعيد مقفلة حتى دفع العربون 20%. التغيير مسموح حتى 48 ساعة قبل الذبح.")
// ---- web ------------------------------------------------------------------------------------------------
const w1 = await wfamily({ path: "Visits/Booking", title: "حجز زيارة", active: 2, states: ["Filled", "Loading", "Error"], err: ["تعذّر تحميل المواعيد", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  await two(b, async (m, w) => add(m, await box(w, async (c, iw) => { await bookBody(c, st, iw) }, { pad: 24, gap: 20 }), "h"),
  async (s, w) => { add(s, await photo(w, 200, "sheep", "cover", "md"), "h"); add(s, await box(w, async (c, iw) => { add(c, await kv(iw, "الزيارة", "الخميس 19 نوفمبر"), "h"); add(c, await kv(iw, "الوقت", "10:00 ص"), "h"); add(c, await kv(iw, "الرسوم", "50.00 ر.س", true), "h"); add(c, await button("تأكيد الحجز", "primary", st === "Filled" ? "default" : "disabled"), "h") }), "h") })
})
const w2 = await wfamily({ path: "Visits/Detail", title: "تفاصيل الحجز", active: 2, states: ["Cancelled", "Loading", "Error"], err: ["تعذّر تحميل الحجز", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  const x = st === "Cancelled"
  await two(b, async (m, w) => add(m, await box(w, async (c, iw) => { add(c, await map(iw, 360), "h"); add(c, await T(FARM[0], "Heading/H3", "ink", iw), "h"); add(c, await T(FARM[1], "Body/M", "ink-2", iw), "h") }, { pad: 24 }), "h"),
  async (s, w) => add(s, await box(w, async (c, iw) => { await detailBody(c, st, iw); add(c, await button("اتصال بالمزرعة", "primary", x ? "disabled" : "default"), "h"); if (!x) add(c, await button("إلغاء الحجز", "ghost"), "h") }), "h"))
})
ctx.y = await yOf(PW, OWN_W)
await sec(PW, "sec-occ-visit-book-web", "حجز زيارة ويب · Visit booking web", [w1])
await sec(PW, "sec-occ-visit-detail-web", "تفاصيل الحجز ويب · Visit detail web", [w2])
print("✅ OCC visits done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
