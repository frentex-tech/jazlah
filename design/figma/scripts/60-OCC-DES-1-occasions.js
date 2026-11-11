// OCC-DES-1 (1/4): occasion request wizard, quote review and accept, deposit/balance payment. Mobile on page 10, web on page 20.
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
async function pill(label, kind) { const f = frame("pill " + kind, { dir: "HORIZONTAL", px: 12, py: 4, fill: ({ success: "sand", info: "sand" }[kind] || kind + "-bg"), r: "pill" }); add(f, await T(label, "Label/M", kind)); chk("pill " + kind, kind, ({ success: "sand", info: "sand" }[kind] || kind + "-bg")); return f }
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
    else if (st === "Empty") { await empty(b, o.empty); await cta(b, o.empty[3]) }
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
const OWN_M = ["sec-occ-wizard-type", "sec-occ-wizard-details", "sec-occ-wizard-date", "sec-occ-quote", "sec-occ-payment"], OWN_W = ["sec-occ-wizard-web", "sec-occ-quote-web"]
const hdr = { type: "page", title: "طلب مناسبة" }
const TYPES = [["عقيقة", "ذبيحة مولود وتوزيع", "sheep"], ["وليمة", "عزيمة عائلية أو عمل", "mandi"], ["عزيمة ضيوف", "مشويات ولحم جاهز", "bbq"], ["تفطير وصدقة", "وجبات للمحتاجين", "roast-paper"]]
async function typeCard(t, sel) {
  const c = frame("type " + t[0], { w: 175, fill: "paper", stroke: sel ? "ember" : "line", sw: sel ? 2 : 1, r: "md", clip: true, cross: "MIN" })
  add(c, await photo(175, 96, t[2], "thumb", "sm"), "h")
  const x = frame("copy", { w: 175, pad: 12, gap: 4 }); add(x, await T(t[0], "Label/M", "ink", 151), "h"); add(x, await T(t[1], "Body/M", "ink-2", 151), "h"); add(c, x, "h"); return c
}
// ---- 1. type ------------------------------------------------------------------------------------------
const pre = n => async b => add(b, await steps(W, n, 3, ["نوع المناسبة", "التفاصيل", "الموعد والمدينة"][n - 1]), "h")
const f1 = await family({ path: "Occasions/Wizard/Type", header: hdr, pre: pre(1), cta: "التالي", states: ["Filled", "Loading", "Empty", "Error"],
  empty: ["calendar-x", "لا توجد مناسبات متاحة", "نضيف أنواع المناسبات قريبًا، يمكنك التواصل معنا لطلب خاص.", "تواصل معنا"], err: ["تعذّر تحميل أنواع المناسبات", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  add(b, await T("ما نوع مناسبتك؟", "Heading/H2", "ink", W), "h")
  for (let r = 0; r < 2; r++) { const row = frame("types", { dir: "HORIZONTAL", gap: 8 }); for (const t of TYPES.slice(r * 2, r * 2 + 2)) add(row, await typeCard(t, st === "Filled" && t[0] === "عقيقة")); add(b, row) }
  add(b, await T("نرسل لك عرض سعر خلال 24 ساعة، ولا يُخصم شيء قبل موافقتك.", "Body/M", "ink-2", W), "h")
  await cta(b, "التالي", st === "Filled" ? "default" : "disabled")
})
// ---- 2. details ---------------------------------------------------------------------------------------
async function details(b, st, w = W) {
  const filled = st === "Filled" || st === "Validation"
  const g = frame("guests", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN", cross: "CENTER" }); add(g, await T("عدد الضيوف", "Label/M", "ink"))
  const sp = inst("stepper", { state: filled ? "default" : "min" }); await retext(sp, filled ? "2" : "1", filled ? "40" : "1"); add(g, sp); add(b, g, "h")
  add(b, await T("نوع الذبيحة", "Label/M", "ink", w), "h")
  const cr = frame("animal", { dir: "HORIZONTAL", gap: 8 }); for (const [i, t] of ["خروف نعيمي", "خروف حري", "ماعز بلدي"].entries()) add(cr, await chip(t, i === 0 && filled ? "selected" : "default")); add(b, cr)
  const cook = frame("cook", { dir: "HORIZONTAL", w, main: "SPACE_BETWEEN", cross: "CENTER" }); add(cook, await T("نطبخ الذبيحة لك (مندي)", "Body/L", "ink"))
  add(cook, inst("switch", { checked: filled ? "yes" : "no", state: "default" })); add(b, cook, "h")
  add(b, await field("اسم صاحب المناسبة", st === "Validation" ? "اكتب هنا" : filled ? "فهد بن سعد الحربي" : null, st === "Validation" ? "error" : filled ? "filled" : "default", st === "Validation" ? "اسم صاحب المناسبة مطلوب" : "يظهر في عرض السعر والفاتورة"), "h")
  add(b, await field("ملاحظات للمتجر", filled ? "بدون عظم للأطفال" : null, filled ? "filled" : "default"), "h")
}
const f2 = await family({ path: "Occasions/Wizard/Details", header: hdr, pre: pre(2), cta: "التالي", states: ["Filled", "Validation", "Loading", "Error"], err: ["تعذّر حفظ التفاصيل", "لم يُفقد ما أدخلته، أعد المحاولة."] }, async (b, st) => {
  await details(b, st); await cta(b, "التالي", st === "Filled" ? "default" : "disabled")
})
// ---- 3. date and city ---------------------------------------------------------------------------------
const f3 = await family({ path: "Occasions/Wizard/Date", header: hdr, pre: pre(3), cta: "إرسال الطلب", states: ["Filled", "Out of coverage", "Loading", "Empty", "Error"],
  empty: ["calendar-x", "لا توجد أيام متاحة", "المتاجر مكتملة في هذه الفترة، جرّب مدينة أخرى أو موعدًا لاحقًا.", "اختيار مدينة أخرى"], err: ["تعذّر تحميل الأيام المتاحة", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  const off = st === "Out of coverage", ok = st === "Filled"
  add(b, await T("المدينة", "Label/M", "ink", W), "h")
  const cr = frame("cities", { dir: "HORIZONTAL", gap: 8 }); for (const t of ["الرياض", "الخرج", "الدرعية", "حفر الباطن"]) add(cr, await chip(t, (off ? t === "حفر الباطن" : ok && t === "الرياض") ? "selected" : "default")); add(b, cr)
  add(b, await T("يوم المناسبة", "Label/M", "ink", W), "h"); add(b, await strip(ok ? 20 : 0))
  if (off) add(b, await note(W, "warning", "حفر الباطن خارج التغطية حاليًا", "اختر مدينة أخرى أو اطلب تواصل فريقنا لتنسيق خاص."), "h")
  else add(b, await box(W, async (c, iw) => { const r = frame("w", { dir: "HORIZONTAL", w: iw, gap: 12, cross: "CENTER" }); add(r, await icon("clock", 24, "ember")); const t = frame("t", { gap: 2, w: iw - 36 })
    add(t, await T(ok ? "نصل بين 8 و 10 صباحًا" : "اختر يومًا لعرض وقت الوصول", "Body/L", "ink", iw - 36), "h"); if (ok) add(t, await T("الجمعة 20 نوفمبر 2026 · بتوقيت الرياض", "Body/M", "ink-2", iw - 36), "h"); add(r, t); add(c, r, "h") }), "h")
  add(b, await field("وصف موقع المناسبة", ok ? "استراحة الندى، حي النرجس" : null, ok ? "filled" : "default"), "h")
  await cta(b, "إرسال الطلب", ok ? "default" : "disabled")
})
// ---- 4. quote -----------------------------------------------------------------------------------------
async function quoteLines(c, w, exp) {
  const h = frame("item", { dir: "HORIZONTAL", w, gap: 12, cross: "CENTER" }); add(h, await photo(56, 56, "sheep", "thumb"))
  const t = frame("t", { gap: 2, w: w - 68 }); add(t, await T("4 خراف نعيمي · عقيقة", "Label/M", "ink", w - 68), "h"); add(t, await T("الجمعة 20 نوفمبر 2026 · الرياض", "Body/M", "ink-2", w - 68), "h"); add(h, t); add(c, h, "h")
  for (const [k, v] of [["4 خراف × 1,150.00 ر.س", "4,600.00 ر.س"], ["الذبح والتقطيع والتغليف", "200.00 ر.س"], ["التوصيل", "150.00 ر.س"], ["ضريبة القيمة المضافة 15%", "742.50 ر.س"]]) add(c, await kv(w, k, v), "h")
  add(c, await kv(w, "الإجمالي", "5,692.50 ر.س", true), "h")
  add(c, await pill(exp ? "انتهت صلاحية العرض" : "ساري حتى الأحد 15 نوفمبر، 6:00 م", exp ? "danger" : "info"))
}
const f4 = await family({ path: "Occasions/Quote", header: { type: "page", title: "عرض السعر" }, cta: "قبول العرض", states: ["Expired", "Loading", "Empty", "Error"],
  empty: ["hourglass", "بانتظار عرض السعر", "يراجع فريقنا طلبك ويرسل لك العرض خلال 24 ساعة.", "تعديل الطلب"], err: ["تعذّر تحميل العرض", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  const exp = st === "Expired"
  add(b, await box(W, (c, iw) => quoteLines(c, iw, exp)), "h")
  add(b, await box(W, async (c, iw) => { add(c, await kv(iw, "العربون عند القبول (30%)", "1,707.75 ر.س"), "h"); add(c, await kv(iw, "المتبقي قبل المناسبة بـ 3 أيام", "3,984.75 ر.س"), "h") }), "h")
  if (exp) add(b, await note(W, "warning", "العرض لم يعد ساريًا", "الأسعار قد تتغير، اطلب عرضًا جديدًا لنفس التفاصيل."), "h")
  await cta(b, exp ? "اطلب عرضًا جديدًا" : "قبول العرض", "default", exp ? null : "طلب تعديل")
})
// ---- 5. payment ---------------------------------------------------------------------------------------
async function payBody(b, st, w = W) {
  const paid = st === "Deposit paid" || st === "Balance locked"
  add(b, await box(w, async (c, iw) => {
    for (const [k, v, p, kind] of [["العربون (30%)", "1,707.75 ر.س", paid ? "مدفوع" : "مستحق الآن", paid ? "success" : "warning"], ["المتبقي (70%)", "3,984.75 ر.س", st === "Deposit paid" ? "مستحق الآن" : "يُفتح 17 نوفمبر", st === "Deposit paid" ? "warning" : "info"]]) {
      const r = frame("stage", { dir: "HORIZONTAL", w: iw, main: "SPACE_BETWEEN", cross: "CENTER" }), t = frame("t", { gap: 4 }); add(t, await T(k, "Body/M", "ink-2")); add(t, await T(v, "Heading/H3", "ink")); add(r, t); add(r, await pill(p, kind)); add(c, r, "h")
    }
    add(c, await kv(iw, "الإجمالي", "5,692.50 ر.س", true), "h")
  }), "h")
  add(b, await T("طريقة الدفع", "Label/M", "ink", w), "h")
  for (const [i, [ic, t, s]] of [["credit-card", "مدى", "•••• 4821"], ["apple-logo", "Apple Pay", "جهازك الحالي"], ["credit-card", "بطاقة ائتمانية", "Visa أو Mastercard"]].entries()) add(b, await opt(w, ic, t, s, i === 0, st === "Balance locked"), "h")
}
const f5 = await family({ path: "Occasions/Payment", header: { type: "page", title: "الدفع" }, cta: "ادفع العربون", states: ["Deposit paid", "Balance locked", "Loading", "Error"], err: ["فشلت عملية الدفع", "لم يُخصم أي مبلغ من بطاقتك. جرّب طريقة أخرى."] }, async (b, st) => {
  await payBody(b, st)
  if (st === "Balance locked") add(b, await note(W, "info", "يُفتح دفع المتبقي قبل المناسبة بـ 3 أيام", "سنذكّرك يوم الثلاثاء 17 نوفمبر."), "h")
  await cta(b, st === "Deposit paid" ? "ادفع المتبقي 3,984.75 ر.س" : st === "Balance locked" ? "ادفع المتبقي" : "ادفع العربون 1,707.75 ر.س", st === "Balance locked" ? "disabled" : "default")
})
ctx.y = await yOf(PM, OWN_M)
await sec(PM, "sec-occ-wizard-type", "طلب مناسبة · 1 النوع · Occasion wizard type", [f1], "الزر معطّل قبل اختيار نوع المناسبة. النص التحتي يوضح أن عرض السعر بلا التزام.")
await sec(PM, "sec-occ-wizard-details", "طلب مناسبة · 2 التفاصيل · Occasion wizard details", [f2])
await sec(PM, "sec-occ-wizard-date", "طلب مناسبة · 3 الموعد والمدينة · Occasion wizard date and city", [f3], "أقل مهلة للحجز 7 أيام. المدن خارج التغطية تعطّل الزر مع تفسير.")
await sec(PM, "sec-occ-quote", "عرض السعر · Quote review and accept", [f4], "العرض ينتهي خلال 72 ساعة. العربون 30% يُدفع عند القبول والباقي قبل المناسبة بـ 3 أيام.")
await sec(PM, "sec-occ-payment", "دفع العربون والمتبقي · Deposit and balance payment", [f5])
// ---- web ------------------------------------------------------------------------------------------------
const w1 = await wfamily({ path: "Occasions/Wizard", title: "طلب مناسبة", active: 2, states: ["Filled", "Validation", "Loading", "Error"], err: ["تعذّر حفظ التفاصيل", "لم يُفقد ما أدخلته، أعد المحاولة."] }, async (b, st) => {
  await two(b, async (m, w) => { add(m, await steps(w, 2, 3, "التفاصيل"), "h")
    add(m, await box(w, async (c, iw) => { await details(c, st, iw); const r = frame("actions", { dir: "HORIZONTAL", gap: 12 }); add(r, await button("التالي", "primary", st === "Filled" ? "default" : "disabled")); add(r, await button("رجوع", "secondary")); add(c, r) }, { pad: 24, gap: 20 }), "h") },
  async (s, w) => { add(s, await photo(w, 160, "sheep", "cover", "md"), "h")
    add(s, await box(w, async (c, iw) => { add(c, await T("ملخص الطلب", "Heading/H3", "ink", iw), "h"); for (const [k, v] of [["المناسبة", "عقيقة"], ["الضيوف", "40 ضيفًا"], ["الذبيحة", "4 خراف نعيمي"], ["الطبخ", "مندي"]]) add(c, await kv(iw, k, v), "h"); add(c, await kv(iw, "تقدير مبدئي", "5,692.50 ر.س", true), "h") }), "h") })
})
const w2 = await wfamily({ path: "Occasions/Quote", title: "عرض السعر", active: 2, states: ["Expired", "Loading", "Empty", "Error"], empty: ["hourglass", "بانتظار عرض السعر", "يراجع فريقنا طلبك ويرسل لك العرض خلال 24 ساعة.", "تعديل الطلب"], err: ["تعذّر تحميل العرض", "تحقق من الاتصال ثم أعد المحاولة."] }, async (b, st) => {
  const exp = st === "Expired"
  await two(b, async (m, w) => add(m, await box(w, (c, iw) => quoteLines(c, iw, exp), { pad: 24 }), "h"),
  async (s, w) => add(s, await box(w, async (c, iw) => { await payBody(c, "Default", iw); if (exp) add(c, await note(iw, "warning", "العرض لم يعد ساريًا"), "h"); add(c, await button(exp ? "اطلب عرضًا جديدًا" : "قبول العرض ودفع العربون"), "h"); if (!exp) add(c, await button("طلب تعديل", "secondary"), "h") }), "h"))
})
ctx.y = await yOf(PW, OWN_W)
await sec(PW, "sec-occ-wizard-web", "طلب مناسبة ويب · Occasion wizard web", [w1])
await sec(PW, "sec-occ-quote-web", "عرض السعر ويب · Quote web", [w2])
print("✅ OCC occasions done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
