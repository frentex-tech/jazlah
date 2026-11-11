// OCC-DES-1 (3/4): cooked dishes, "cook it for me", Adha season landing, day picker, cut restrictions. Mobile on page 10, web (landing, day picker + cuts) on page 20.
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
const OWN_M = ["sec-occ-dishes", "sec-occ-cook-it", "sec-occ-adha-landing", "sec-occ-adha-day", "sec-occ-adha-cuts"], OWN_W = ["sec-occ-adha-landing-web", "sec-occ-adha-day-web"]
async function hero(w, h, key, title, sub) {
  const f = await photo(w, h, key, "banner", "lg"), s = rect("scrim", w, h, "brand-deep", null, { alpha: 0.6 }); f.appendChild(s); s.layoutPositioning = "ABSOLUTE"; s.x = 0; s.y = 0
  const t = frame("copy", { w, pad: 16, gap: 4 }); add(t, await T(title, "Display/L", "gold-light", w - 32), "h"); add(t, await T(sub, "Body/M", "paper", w - 32), "h")
  f.appendChild(t); t.layoutPositioning = "ABSOLUTE"; t.x = 0; t.y = h - t.height; chk("hero title", "gold-light", "brand-deep"); chk("hero sub", "paper", "brand-deep"); return f
}
async function dish(title, sub, price, key, state = "default") {
  const p = inst("product-card", { state }); await retext(p, "مجازر الفلاح", "مطبخ جزلة"); await retext(p, "ريب آي بقري طازج", title); await retext(p, "500 جم · تقطيع شرائح", sub); await retext(p, "89.00", price)
  const ph = p.findOne(n => n.name === "ph/image"); if (ph && ph.parent) ph.parent.setSharedPluginData(NS, "photo", key); return p
}
// ---- 1. cooked dishes ----------------------------------------------------------------------------------
const DISHES = [["مندي لحم", "يكفي 4 أشخاص · جاهز خلال 3 ساعات", "245.00", "mandi"], ["مظبي ضأن", "يكفي 4 أشخاص · جاهز خلال 3 ساعات", "265.00", "lamb-spit"], ["كبسة لحم", "يكفي 3 أشخاص · جاهز خلال ساعتين", "185.00", "roast-paper"], ["مشاوي مشكّلة", "1 كجم · جاهز خلال ساعة", "159.00", "bbq"]]
const f1 = await family({ path: "Cooking/Dishes", header: { type: "page", title: "أطباق جاهزة" }, tab: "2", cta: "عرض السلة", states: ["Unavailable dish", "Loading", "Empty", "Error"],
  empty: ["cooking-pot", "لا توجد أطباق اليوم", "يفتح المطبخ طلبات الغد بعد الساعة 6 مساءً بتوقيت الرياض.", "تنبيهي عند التوفر"], err: ["تعذّر تحميل الأطباق", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  const cr = frame("kinds", { dir: "HORIZONTAL", gap: 8 }); for (const [i, t] of ["الكل", "مندي", "مظبي", "كبسة"].entries()) add(cr, await chip(t, i === 0 ? "selected" : "default")); add(b, cr)
  for (let r = 0; r < 2; r++) { const row = frame("dishes", { dir: "HORIZONTAL", gap: 28 }); for (const [i, d] of DISHES.slice(r * 2, r * 2 + 2).entries()) add(row, await dish(d[0], d[1], d[2], d[3], st === "Unavailable dish" && r === 1 && i === 0 ? "unavailable" : "default")); add(b, row) }
  add(b, await note(W, "info", "يُطبخ يوميًا في مطبخ جزلة المركزي", "اطلب قبل الساعة 2 ظهرًا ليصلك في نفس اليوم."), "h")
})
// ---- 2. cook it for me ---------------------------------------------------------------------------------
const STYLES = [["مندي", "رز مندي ولحم مدخّن · 60.00 ر.س للحيوان الواحد", "mandi"], ["مظبي", "لحم مشوي على الحجر · 75.00 ر.س", "lamb-spit"], ["كبسة", "رز كبسة ولحم مسلوق · 55.00 ر.س", "roast-paper"], ["بدون طبخ", "نستلم اللحم نيئًا مقطّعًا", null]]
const f2 = await family({ path: "Cooking/CookItForMe", header: { type: "page", title: "اطبخها لي" }, cta: "إضافة للطلب", states: ["Filled", "Date unavailable", "Loading", "Error"], err: ["تعذّر تحميل خيارات الطبخ", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  const off = st === "Date unavailable", sel = st === "Filled" ? 0 : off ? -1 : 3
  add(b, await T("اختر طريقة الطبخ للذبيحة", "Heading/H3", "ink", W), "h")
  for (const [i, s] of STYLES.entries()) add(b, await opt(W, "circle", s[0], s[1], i === sel, off && i < 3), "h")
  add(b, off ? await note(W, "warning", "الطبخ غير متاح الجمعة 20 نوفمبر", "المطبخ مكتمل في هذا اليوم. اختر يومًا آخر أو استلمها نيئة.") : await box(W, async (c, iw) => { add(c, await kv(iw, "وقت جاهزية الطبخ", sel === 0 ? "الجمعة 20 نوفمبر، 12:30 ظهرًا" : "عند الاستلام"), "h"); add(c, await kv(iw, "الإضافة", sel === 0 ? "240.00 ر.س" : "0.00 ر.س", true), "h") }), "h")
  await cta(b, "إضافة للطلب", sel === 0 ? "default" : "disabled")
})
// ---- 3. Adha landing -----------------------------------------------------------------------------------
const OFFERS = [["خروف نعيمي", "من 1,250.00 ر.س · 45 إلى 55 كجم", "sheep"], ["ماعز بلدي", "من 1,100.00 ر.س · 30 إلى 40 كجم", "sheep"], ["حاشي (ناقة صغيرة)", "من 9,500.00 ر.س · سبع حصص", "camel-calf"]]
async function offerRow(w, o) { return box(w, async (c, iw) => { const r = frame("offer", { dir: "HORIZONTAL", w: iw, gap: 12, cross: "CENTER" }); add(r, await photo(64, 64, o[2], "thumb")); const t = frame("t", { gap: 4, w: iw - 76 }); add(t, await T(o[0], "Label/M", "ink", iw - 76), "h"); add(t, await T(o[1], "Body/M", "ink-2", iw - 76), "h"); add(r, t); add(c, r, "h") }) }
const f3 = await family({ path: "Adha/Landing", header: { type: "page", title: "الأضاحي" }, tab: "2", cta: "احجز أضحيتك", states: ["Booking closed", "Loading", "Empty", "Error"],
  empty: ["calendar-blank", "الموسم لم يبدأ بعد", "يفتح الحجز المبكر لعيد الأضحى 1448 قريبًا، سنخبرك فور فتحه.", "ذكّرني"], err: ["تعذّر تحميل الموسم", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  const closed = st === "Booking closed"
  add(b, await hero(W, 190, "camel-calf", "عيد الأضحى 1448", "المتوقع الأحد 16 مايو 2027 بحسب الرؤية"), "h")
  add(b, await note(W, closed ? "warning" : "success", closed ? "أُغلق الحجز المبكر" : "الحجز المبكر مفتوح", closed ? "تبقّى الحجز المباشر في أيام العيد حسب التوفر." : "حتى الخميس 6 مايو 2027 بلا رسوم إضافية."), "h")
  for (const o of OFFERS) add(b, await offerRow(W, o), "h")
  await cta(b, "احجز أضحيتك", closed ? "disabled" : "default")
})
// ---- 4. day picker -------------------------------------------------------------------------------------
const DAYS = [["يوم العيد · الأحد 16 مايو", "10 ذو الحجة · 86 موعدًا متبقيًا"], ["أول التشريق · الاثنين 17 مايو", "11 ذو الحجة · 12 موعدًا فقط"], ["ثاني التشريق · الثلاثاء 18 مايو", "12 ذو الحجة · مكتمل"], ["ثالث التشريق · الأربعاء 19 مايو", "13 ذو الحجة · 40 موعدًا متبقيًا"]]
async function dayRows(b, w, sel) { for (const [i, d] of DAYS.entries()) add(b, await opt(w, "calendar-blank", d[0], d[1], i === sel, i === 2), "h") }
const f4 = await family({ path: "Adha/DayPicker", header: { type: "page", title: "يوم الذبح" }, cta: "التالي", states: ["Filled", "Loading", "Empty", "Error"],
  empty: ["calendar-blank", "لم تُعلن الأيام بعد", "تُؤكَّد أيام الذبح بعد إعلان رؤية الهلال، وسنرسل لك إشعارًا.", "ذكّرني"], err: ["تعذّر تحميل الأيام", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  add(b, await T("متى تريد ذبح أضحيتك؟", "Heading/H3", "ink", W), "h"); await dayRows(b, W, st === "Filled" ? 0 : -1)
  add(b, await note(W, "info", "تتأكد الأيام بعد رؤية الهلال", "ننقل حجزك تلقائيًا إذا تغيّر التاريخ."), "h")
  await cta(b, "التالي", st === "Filled" ? "default" : "disabled")
})
// ---- 5. cut restrictions -------------------------------------------------------------------------------
const CUTS = [["كاملة بدون تقطيع", "تصلك الذبيحة كاملة منظّفة", 0], ["أرباع", "4 قطع كبيرة · الأنسب للتوزيع", 0], ["قطع للطبخ", "قطع متوسطة للمندي والكبسة", 0], ["مفروم ومقطّع صغير", "لا يتوفر يوم العيد لضغط الطلب", 1]]
async function cutRows(b, w, sel) { for (const [i, c] of CUTS.entries()) add(b, await opt(w, "knife", c[0], c[1], i === sel, c[2] === 1), "h") }
const f5 = await family({ path: "Adha/Cuts", header: { type: "page", title: "طريقة التقطيع" }, cta: "متابعة", states: ["Filled", "Loading", "Error"], err: ["تعذّر تحميل خيارات التقطيع", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  add(b, await T("الأحد 16 مايو · يوم العيد", "Label/M", "ink-2", W), "h"); await cutRows(b, W, st === "Filled" ? 1 : -1)
  add(b, await note(W, "warning", "قيود يوم العيد", "الخيارات الصغيرة متاحة من الاثنين 17 مايو. الحاشي يُقطّع أرباعًا فقط."), "h")
  await cta(b, "متابعة", st === "Filled" ? "default" : "disabled")
})
ctx.y = await yOf(PM, OWN_M)
await sec(PM, "sec-occ-dishes", "الأطباق الجاهزة · Cooked dishes", [f1])
await sec(PM, "sec-occ-cook-it", "اطبخها لي · Cook it for me", [f2], "إضافة الطبخ 60.00 ر.س لكل حيوان. إن امتلأ المطبخ في اليوم المختار تتعطل الخيارات مع بديل.")
await sec(PM, "sec-occ-adha-landing", "موسم الأضحى · Adha landing", [f3])
await sec(PM, "sec-occ-adha-day", "يوم ذبح الأضحية · Adha day picker", [f4], "الأيام المكتملة معطّلة. التواريخ تتأكد بعد رؤية الهلال.")
await sec(PM, "sec-occ-adha-cuts", "قيود التقطيع · Adha cut restrictions", [f5])
// ---- web ------------------------------------------------------------------------------------------------
const w1 = await wfamily({ path: "Adha/Landing", title: "الأضاحي · عيد الأضحى 1448", active: 2, states: ["Booking closed", "Loading", "Error"], err: ["تعذّر تحميل الموسم", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  const closed = st === "Booking closed"
  add(b, await hero(1200, 280, "camel-calf", "عيد الأضحى 1448", "المتوقع الأحد 16 مايو 2027 بحسب الرؤية"), "h")
  await two(b, async (m, w) => { for (const o of OFFERS) add(m, await offerRow(w, o), "h") },
  async (s, w) => add(s, await box(w, async (c, iw) => { add(c, await note(iw, closed ? "warning" : "success", closed ? "أُغلق الحجز المبكر" : "الحجز المبكر مفتوح", closed ? "الحجز المباشر في أيام العيد حسب التوفر." : "حتى الخميس 6 مايو 2027."), "h"); add(c, await button("احجز أضحيتك", "primary", closed ? "disabled" : "default"), "h") }), "h"))
})
const w2 = await wfamily({ path: "Adha/DayAndCuts", title: "يوم الذبح وطريقة التقطيع", active: 2, states: ["Filled", "Loading", "Error"], err: ["تعذّر تحميل الأيام", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  await two(b, async (m, w) => { add(m, await T("يوم الذبح", "Heading/H3", "ink", w), "h"); await dayRows(m, w, st === "Filled" ? 0 : -1) },
  async (s, w) => { add(s, await T("طريقة التقطيع", "Heading/H3", "ink", w), "h"); await cutRows(s, w, st === "Filled" ? 1 : -1); add(s, await note(w, "warning", "قيود يوم العيد", "الخيارات الصغيرة متاحة من الاثنين 17 مايو."), "h"); add(s, await button("متابعة", "primary", st === "Filled" ? "default" : "disabled"), "h") })
})
ctx.y = await yOf(PW, OWN_W)
await sec(PW, "sec-occ-adha-landing-web", "موسم الأضحى ويب · Adha landing web", [w1])
await sec(PW, "sec-occ-adha-day-web", "يوم الذبح والتقطيع ويب · Adha day and cuts web", [w2])
print("✅ OCC cooking and Adha done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
