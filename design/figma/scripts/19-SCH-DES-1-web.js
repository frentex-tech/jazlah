// SCH-DES-1 (web + admin): web checkout step 1 (page 20 Customer Web) and the admin operations settings page (page 30 Admin).
// Arabic RTL, built from components/templates only. States are separate screens. Prototype links not wired.
await loadDS()
const ctx = { y: 0 }
const PW = "20 Customer Web", PA = "30 Admin"
const ownY = async (pg, own) => {
  await page(pg).loadAsync()
  const rest = page(pg).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  return rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0
}
ctx.y = await ownY(PW, ["sec-sch-checkout-w"])

// ---- shared helpers (copied in both SCH-DES-1 scripts) ------------------------------------------------
const REASON = {
  closed: ["lock-simple", "مغلق: عطلة المتجر"],
  full: ["users-three", "مكتمل: لا توجد سعة"],
  cutoff: ["clock-countdown", "انتهى وقت الطلب لهذا اليوم"],
}
const DAY_NAMES = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
const sar = h => (h / 100).toFixed(2) + " ر.س"
// day cell looks: fill, stroke, fg (text), ic (icon)
const KINDS = {
  sel: { fill: "ember", fg: "paper", ic: "check" },
  avail: { fill: "paper", stroke: "line", fg: "ink" },
  closed: { fill: "sand", fg: "ink-2", ic: REASON.closed[0] },
  full: { fill: "sand", fg: "ink-2", ic: REASON.full[0] },
  cutoff: { fill: "sand", fg: "ink-2", ic: REASON.cutoff[0] },
  past: { fg: "ink-2" },
  off: { fill: "danger-bg", fg: "danger", ic: "x" },
  today: { fill: "paper", stroke: "ember", sw: 2, fg: "ink" },
}
chk("day selected", "paper", "ember"); chk("day available", "ink", "paper"); chk("day available sub", "ink-2", "paper")
chk("day disabled", "ink-2", "sand"); chk("day past on bg", "ink-2", "bg"); chk("day past on paper", "ink-2", "paper")
chk("day closed admin", "danger", "danger-bg"); chk("weekday header", "ink-2", "paper")
chk("reason card", "warning", "warning-bg"); chk("reason card sub", "ink-2", "warning-bg"); chk("reason card ink", "ink", "warning-bg")
chk("legend on bg", "ink-2", "bg"); chk("legend title on bg", "ink", "bg"); chk("card text", "ink", "paper"); chk("card sub", "ink-2", "paper")
chk("error block", "danger", "danger-bg"); chk("error block sub", "ink-2", "danger-bg"); chk("addr icon", "ember", "paper", 3)
chk("link", "ember", "bg"); chk("step label", "ink-2", "bg"); chk("title on bg", "ink", "bg"); chk("addr off sub", "ink-2", "sand")

async function dayCell(o) {
  const c = frame("day " + o.num, { w: o.w, h: o.h, main: "CENTER", cross: "CENTER", fill: o.fill, stroke: o.focus ? "ember" : o.stroke, sw: o.focus ? 2 : o.sw, r: "md" })
  if (o.dow) add(c, await txt(o.dow, "Caption", o.fg, { align: "CENTER", w: o.w - 8 }))
  add(c, await txt(String(o.num), o.big ? "Heading/H3" : "Label/M", o.fg, { align: "CENTER", w: o.w - 8 }))
  if (o.ic) add(c, await icon(o.ic, o.big ? 16 : 14, o.fg))
  return c
}
// Month grid: 7 columns, RTL, Saturday first. Nov 2026 starts on a Sunday (column 1), 30 days.
async function monthGrid(cw, ch, gap, cellOf) {
  const g = frame("month grid", { gap, cross: "CENTER" })
  const hr = frame("weekdays", { dir: "HORIZONTAL", gap })
  for (const n of DAY_NAMES) add(hr, await txt(n, "Caption", "ink-2", { align: "CENTER", w: cw }))
  add(g, hr)
  for (let r = 0; r < 5; r++) {
    const row = frame("week " + (r + 1), { dir: "HORIZONTAL", gap })
    for (let c = 0; c < 7; c++) {
      const d = r * 7 + c
      if (d < 1 || d > 30) add(row, frame("empty", { w: cw, h: ch }))
      else add(row, await dayCell({ w: cw, h: ch, num: d, ...KINDS[cellOf(d)] }))
    }
    add(g, row)
  }
  return g
}
async function monthNav(w, title) {
  const r = frame("month nav", { dir: "HORIZONTAL", w, h: 44, cross: "CENTER", main: "SPACE_BETWEEN" })
  for (const [n, side] of [["caret-right", 0], ["title", 1], ["caret-left", 2]]) {
    if (side === 1) { add(r, await txt(title, "Heading/H3", "ink", { align: "CENTER" })); continue }
    const b = frame("nav " + n, { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "paper", stroke: "line", r: "pill" })
    add(b, await icon(n, 20, "ink")); add(r, b)
  }
  return r
}
async function stripCells(cw, items, selNum, focusNum) {
  const row = frame("day strip", { dir: "HORIZONTAL", gap: 8 })
  for (const [dow, num, kind] of items) add(row, await dayCell({ w: cw, h: 76, dow, num, big: true, ...KINDS[num === selNum ? "sel" : kind], focus: num === focusNum }))
  return row
}
const STRIP = [["الثلاثاء", 10, "cutoff"], ["الأربعاء", 11, "avail"], ["الخميس", 12, "full"], ["الجمعة", 13, "closed"], ["السبت", 14, "avail"], ["الأحد", 15, "avail"], ["الاثنين", 16, "avail"]]
const FOCUS = { cutoff: 10, full: 12, closed: 13 }
const DAYLBL = { 10: "الثلاثاء 10 نوفمبر", 11: "الأربعاء 11 نوفمبر", 12: "الخميس 12 نوفمبر", 13: "الجمعة 13 نوفمبر" }

async function reasonCard(w, kind) {
  const f = frame("day reason " + kind, { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, fill: "warning-bg", r: "md" })
  add(f, await icon(REASON[kind][0], 24, "warning"))
  const col = frame("copy", { gap: 4, w: w - 32 - 24 - 12 })
  add(col, await txt(REASON[kind][1], "Label/M", "warning", { w: col.width }), "h")
  add(col, await txt(DAYLBL[FOCUS[kind]] + " · اختر يومًا آخر متاحًا", "Body/M", "ink-2", { w: col.width }), "h")
  add(f, col)
  return f
}
async function windowCard(w, line, sub) {
  const f = frame("window", { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  add(f, await icon("clock", 24, "ember"))
  const col = frame("copy", { gap: 2, w: w - 32 - 24 - 12 })
  add(col, await txt(line, "Body/L", "ink", { w: col.width }), "h")
  add(col, await txt(sub, "Body/M", "ink-2", { w: col.width }), "h")
  add(f, col)
  return f
}
async function legend(w, bgKey) {
  const f = frame("legend", { w, gap: 8 })
  add(f, await txt("دليل الأيام", "Label/M", "ink", { w }), "h")
  for (const k of ["closed", "full", "cutoff"]) {
    const r = frame("legend " + k, { dir: "HORIZONTAL", gap: 12, cross: "CENTER", w })
    const sw = frame("swatch", { dir: "HORIZONTAL", w: 28, h: 28, main: "CENTER", cross: "CENTER", fill: "sand", r: "sm" })
    add(sw, await icon(REASON[k][0], 16, "ink-2")); add(r, sw)
    add(r, await txt(REASON[k][1], "Body/M", "ink-2", { w: w - 40 }), "h")
    add(f, r, "h")
  }
  chk("legend " + bgKey, "ink-2", bgKey); chk("legend title " + bgKey, "ink", bgKey)
  return f
}
async function pausedBanner(w) {
  const f = frame("paused banner", { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, fill: "warning-bg", stroke: "warning", r: "md" })
  add(f, await icon("pause-circle", 24, "warning", "fill"))
  const col = frame("copy", { gap: 4, w: w - 32 - 24 - 12 })
  add(col, await txt("الطلبات متوقفة مؤقتًا، سنعود قريبًا", "Label/M", "warning", { w: col.width }), "h")
  add(col, await txt("يمكنك تصفّح المتجر وإكمال الطلب عند استئناف الاستقبال.", "Body/M", "ink-2", { w: col.width }), "h")
  add(f, col)
  return f
}
async function errorBlock(w) {
  const f = frame("days error", { w, pad: 16, gap: 12, fill: "danger-bg", stroke: "danger", r: "md" })
  const r = frame("row", { dir: "HORIZONTAL", gap: 12, w: w - 32 })
  add(r, await icon("warning-circle", 24, "danger"))
  const col = frame("copy", { gap: 4, w: w - 32 - 36 })
  add(col, await txt("تعذّر تحميل الأيام المتاحة", "Label/M", "danger", { w: col.width }), "h")
  add(col, await txt("تحقق من الاتصال ثم أعد المحاولة.", "Body/M", "ink-2", { w: col.width }), "h")
  add(r, col); add(f, r, "h")
  add(f, await button("إعادة المحاولة", "secondary", "default", "S"))
  return f
}
async function addrRow(w, title, sub, mode) {
  const off = mode === "off"
  const f = frame("address " + mode, { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, cross: "CENTER", fill: off ? "sand" : "paper", stroke: mode === "sel" ? "ember" : "line", sw: mode === "sel" ? 2 : 1, r: "md" })
  f.minHeight = 56
  add(f, await icon(mode === "sel" ? "check-circle" : off ? "prohibit" : "circle", 24, mode === "sel" ? "ember" : "ink-2", mode === "sel" ? "fill" : "regular"))
  const col = frame("copy", { gap: 4, w: w - 32 - 24 - 12 })
  add(col, await txt(title, "Label/M", off ? "ink-2" : "ink", { w: col.width }), "h")
  add(col, await txt(sub, "Body/M", "ink-2", { w: col.width }), "h")
  if (off) {
    const p = frame("reason", { dir: "HORIZONTAL", px: 8, py: 4, fill: "danger-bg", r: "pill" })
    add(p, await txt("خارج نطاق التغطية", "Label/M", "danger")); add(col, p)
  }
  add(f, col)
  return f
}
async function pickupCard(w, mapH) {
  const c = frame("pickup card", { w, pad: 16, gap: 12, fill: "paper", stroke: "line", r: "md" })
  const r = frame("store", { dir: "HORIZONTAL", gap: 12, w: w - 32 })
  add(r, await icon("storefront", 24, "ember"))
  const col = frame("copy", { gap: 4, w: w - 32 - 36 })
  add(col, await txt("مجازر الفلاح · فرع العليا", "Label/M", "ink", { w: col.width }), "h")
  add(col, await txt("الرياض، حي العليا، طريق التخصصي", "Body/M", "ink-2", { w: col.width }), "h")
  const h = frame("hours", { dir: "HORIZONTAL", gap: 8, cross: "CENTER", w: col.width })
  add(h, await icon("clock", 16, "ink-2")); add(h, await txt("الاستلام من 9 ص إلى 10 م", "Body/M", "ink-2", { w: col.width - 24 }), "h")
  add(col, h, "h"); add(r, col); add(c, r, "h")
  const map = frame("map placeholder", { dir: "HORIZONTAL", w: w - 32, h: mapH, main: "CENTER", cross: "CENTER", fill: "sand", r: "md" })
  add(map, await icon("map-pin", 28, "ink-2", "fill")); add(c, map, "h")
  add(c, await button("اتصال بالمتجر", "secondary"), "h")
  return c
}
async function toggleRow(w, mode) {
  const r = frame("fulfilment toggle", { dir: "HORIZONTAL", w, gap: 8 })
  add(r, await chip("توصيل للعنوان", mode === "delivery" ? "selected" : "default"), "h")
  add(r, await chip("استلام من المتجر", mode === "pickup" ? "selected" : "default"), "h")
  return r
}
async function stepRow(w) {
  const f = frame("step indicator", { w, gap: 8 })
  add(f, await txt("الخطوة 1 من 3: الاستلام واليوم", "Label/M", "ink-2", { w }), "h")
  const bars = frame("bars", { dir: "HORIZONTAL", gap: 8 })
  const bw = Math.floor((w - 16) / 3)
  for (let i = 0; i < 3; i++) add(bars, rect("step " + (i + 1), bw, 4, i === 0 ? "ember" : "line", "pill"))
  add(f, bars)
  return f
}
async function sectionTitle(w, title, link) {
  const r = frame("title row", { dir: "HORIZONTAL", w, h: 44, cross: "CENTER", main: "SPACE_BETWEEN" })
  add(r, await txt(title, "Heading/H3", "ink"))
  if (link) {
    const l = frame("calendar link", { dir: "HORIZONTAL", h: 44, gap: 4, cross: "CENTER" })
    add(l, await icon("calendar-blank", 20, "ember")); add(l, await txt(link, "Label/M", "ember")); add(r, l)
  }
  return r
}

// ================================ Web checkout step 1 ================================
const CARD_W = 760, IN_W = 712
function card(title) { return frame("card " + title, { w: CARD_W, pad: 24, gap: 16, fill: "paper", stroke: "line", r: "md" }) }
async function summaryCard(o) {
  const c = frame("order summary", { w: 416, pad: 24, gap: 16, fill: "paper", stroke: "line", r: "md" })
  add(c, await txt("ملخص الطلب", "Heading/H2", "ink", { w: 368 }), "h")
  if (o.loading) { for (const h of [56, 56, 16, 16, 24]) add(c, rect("skeleton", 368, h, "sand", "sm")); return c }
  const row = async (l, v, st = "Body/M", fg = "ink") => {
    const r = frame("row", { dir: "HORIZONTAL", w: 368, main: "SPACE_BETWEEN", cross: "CENTER" })
    add(r, await txt(l, st, fg, { w: 240 })); add(r, await txt(v, st, fg, { align: "LEFT" })); return r
  }
  const items = [["ريب آي بقري طازج × 2", 17800], ["خروف نعيمي · نصف ذبيحة × 1", 45000]]
  for (const [n, p] of items) add(c, await row(n, sar(p)), "h")
  add(c, rect("divider", 368, 1, "line"), "h")
  const sub = 62800, fee = o.pickup ? 0 : 2500, total = sub + fee, vat = Math.round(total * 15 / 115)
  add(c, await row("المجموع الفرعي", sar(sub), "Body/M", "ink-2"), "h")
  add(c, await row("رسوم التوصيل", sar(fee), "Body/M", "ink-2"), "h")
  add(c, await row("منها ضريبة القيمة المضافة 15%", sar(vat), "Body/M", "ink-2"), "h")
  add(c, rect("divider", 368, 1, "line"), "h")
  add(c, await row("الإجمالي", sar(total), "Heading/H2"), "h")
  return c
}
// o: mode, paused, view normal|loading|error
async function checkoutW(state, o = {}) {
  const w = await webScreen({ path: "Checkout/Fulfilment", state, active: 1 })
  const b = w.body, mode = o.mode || "delivery", view = o.view || "normal"
  const head = frame("heading", { w: 1200, gap: 8 })
  add(head, await txt("إتمام الطلب", "Display/L", "ink", { w: 1200 }), "h"); add(head, await stepRow(1200), "h")
  add(b, head, "h")
  const row = frame("columns", { dir: "HORIZONTAL", w: 1200, gap: 24 })
  const form = frame("form", { w: CARD_W, gap: 16 })
  if (o.paused) add(form, await pausedBanner(CARD_W), "h")
  const sk = h => rect("skeleton", IN_W, h, "sand", "md")
  // pickup method
  const a = card("method"); add(a, await txt("طريقة الاستلام", "Heading/H2", "ink", { w: IN_W }), "h")
  add(a, view === "loading" ? sk(44) : await toggleRow(IN_W, mode), "h"); add(form, a, "h")
  // address or pickup info
  const d = card("where"); add(d, await txt(mode === "delivery" ? "عنوان التوصيل" : "موقع الاستلام", "Heading/H2", "ink", { w: IN_W }), "h")
  if (view === "loading") { add(d, sk(64), "h"); add(d, sk(64), "h") }
  else if (mode === "delivery") {
    add(d, await addrRow(IN_W, "المنزل · حي الملقا", "الرياض، طريق أنس بن مالك", "sel"), "h")
    add(d, await addrRow(IN_W, "المزرعة · طريق القصيم", "بريدة، خارج نطاق التوصيل الحالي", "off"), "h")
    add(d, await button("إضافة عنوان جديد", "secondary", "default", "S"))
  } else add(d, await pickupCard(IN_W, 160), "h")
  add(form, d, "h")
  // day
  const e = card("day"); add(e, await sectionTitle(IN_W, mode === "delivery" ? "يوم التوصيل" : "يوم الاستلام"), "h")
  if (view === "loading") { add(e, sk(76), "h"); add(e, sk(56), "h") }
  else {
    const strip = await stripCells(92, STRIP, o.paused || view === "error" ? null : 11)
    add(e, strip)
    if (view === "error") add(e, await errorBlock(IN_W), "h")
    else {
      add(e, await windowCard(IN_W, mode === "delivery" ? "يصل بين 4 و 6 مساءً" : "جاهز للاستلام بين 4 و 6 مساءً", "الأربعاء 11 نوفمبر · بتوقيت الرياض"), "h")
      add(e, await legend(IN_W, "paper"), "h")
    }
  }
  add(form, e, "h")
  add(form, await button("متابعة إلى الدفع", "primary", o.paused || view !== "normal" ? "disabled" : "default"), "h")
  add(row, form); add(row, await summaryCard({ pickup: mode === "pickup", loading: view === "loading" }))
  add(b, row, "h")
  return w
}
const wBase = await checkoutW("Default")
const wPick = await checkoutW("Pickup", { mode: "pickup" })
const wPaused = await checkoutW("Paused", { paused: true })
const wLoad = await checkoutW("Loading", { view: "loading" })
const wErr = await checkoutW("Error", { view: "error" })
await screenSection(ctx, PW, "sec-sch-checkout-w", "الدفع · الخطوة 1 (ويب) · Checkout step 1 (web)", async S => {
  S.main.push(wBase.screen, wPick.screen); S.states.push(wPaused.screen, wLoad.screen, wErr.screen)
})

// ================================ Admin: operations settings ================================
ctx.y = await ownY(PA, ["sec-sch-ops-settings"])

async function formSection(title, sub, err, build) {
  const i = inst("form-section", { state: err ? "error" : "default" })
  await retext(i, "المعلومات الأساسية", title)
  await retext(i, "اسم المنتج ووصفه كما يظهر للعميل في المتجر.", sub)
  return slot(i, "fields", build)
}
async function pauseCard(paused) {
  const c = frame("pause card " + (paused ? "paused" : "open"), { w: 1132, pad: 24, gap: 20, fill: paused ? "warning-bg" : "paper", stroke: paused ? "warning" : "line", sw: paused ? 2 : 1, r: "md" })
  const top = frame("top", { dir: "HORIZONTAL", w: 1084, main: "SPACE_BETWEEN", cross: "CENTER" })
  const grp = frame("copy group", { dir: "HORIZONTAL", gap: 16, cross: "CENTER" })
  const ring = frame("icon", { dir: "HORIZONTAL", w: 72, h: 72, main: "CENTER", cross: "CENTER", fill: paused ? "paper" : "sand", r: "pill" })
  add(ring, await icon(paused ? "pause-circle" : "play-circle", 40, paused ? "warning" : "success", "fill")); add(grp, ring)
  const col = frame("copy", { gap: 8, w: 640 })
  const bd = inst("badge", { type: paused ? "warning" : "success", size: "M" })
  await retext(bd, paused ? "قيد التجهيز" : "تم التسليم", paused ? "الطلبات متوقفة" : "الطلبات مفتوحة")
  add(col, bd)
  add(col, await txt(paused ? "استقبال الطلبات متوقف الآن" : "استقبال الطلبات", "Display/L", "ink", { w: 640 }), "h")
  add(col, await txt(paused ? "يرى العملاء رسالة الإيقاف ولا يمكنهم إكمال الطلب. أوقف المفتاح لاستئناف الاستقبال فورًا." : "المتجر يستقبل الطلبات بشكل طبيعي. أوقف الاستقبال فورًا عند الحاجة وستظهر رسالة للعملاء.", "Body/L", "ink-2", { w: 640 }), "h")
  add(grp, col); add(top, grp)
  const sw = inst("switch", { checked: paused ? "yes" : "no", state: "default" })
  await retext(sw, "إضافة تغليف هدية", "إيقاف استقبال الطلبات"); add(top, sw)
  add(c, top, "h")
  const msg = frame("message", { w: 374, pad: 16, fill: "paper", stroke: "line", r: "md" })
  add(msg, await field("الرسالة التي تظهر للعملاء", "الطلبات متوقفة مؤقتًا، سنعود قريبًا", "filled", "تظهر في أعلى صفحة الدفع عند الإيقاف (FR-SCH-07)"))
  add(c, msg)
  chk("pause title", "ink", paused ? "warning-bg" : "paper"); chk("pause body", "ink-2", paused ? "warning-bg" : "paper")
  chk("pause icon", paused ? "warning" : "success", paused ? "paper" : "sand", 3)
  return c
}
async function adminBody(body, err) {
  add(body, await pauseCard(false), "h")
  const lbl = t => txt(t, "Body/M", "ink-2")
  add(body, await formSection("ساعات العمل", "حدّد أيام وساعات استقبال التوصيل والاستلام لكل يوم.", false, async s => {
    for (const d of DAY_NAMES) {
      const off = d === "الجمعة"
      const r = frame("hours " + d, { dir: "HORIZONTAL", gap: 16, cross: "CENTER" })
      const sw = inst("switch", { checked: off ? "no" : "yes", state: "default" }); await retext(sw, "إضافة تغليف هدية", d + (off ? " · مغلق" : " · مفتوح"))
      const swBox = frame("day switch", { dir: "HORIZONTAL", w: 200, h: 44, cross: "CENTER" }); add(swBox, sw); add(r, swBox)
      for (const [k, t] of [["من", "8:00 ص"], ["إلى", "10:00 م"]]) {
        add(r, await txt(k, "Body/M", "ink-2", { w: 32 }))
        const sel = inst("select", { state: off ? "disabled" : "filled" })
        await retext(sel, off ? "الحالة" : "قيد التجهيز", off ? "—" : t); add(r, sel)
      }
      add(s, r)
    }
  }), "h")
  add(body, await formSection("السعة اليومية وآخر وقت للطلب", "الحد الأقصى للطلبات والذبائح في اليوم، وآخر وقت لقبول الطلب لكل نوع.", err, async s => {
    const pair = async (a, b) => { const r = frame("pair", { dir: "HORIZONTAL", gap: 24 }); add(r, a); add(r, b); add(s, r) }
    await pair(await field("الحد الأقصى للطلبات يوميًا", err ? "0" : "120", err ? "error" : "filled", err ? "يجب أن يكون الحد أكبر من صفر" : "يُغلق اليوم تلقائيًا عند بلوغه"),
               await field("الحد الأقصى للذبائح يوميًا", "40", "filled", "يُغلق اليوم تلقائيًا عند بلوغه"))
    await pair(await field("آخر وقت للطلب: لحوم جاهزة", "14:00", "filled", "بتوقيت الرياض"), await field("آخر وقت للطلب: ذبيحة", "12:00", "filled", "بتوقيت الرياض"))
    await pair(await field("آخر وقت للطلب: طبخ", err ? "25:00" : "10:00", err ? "error" : "filled", err ? "أدخل وقتًا صحيحًا بصيغة 24 ساعة" : "بتوقيت الرياض"), await field("آخر وقت للطلب: مناسبة", "09:00", "filled", "بتوقيت الرياض"))
    const tz = frame("timezone note", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" })
    add(tz, await icon("info", 20, "info")); add(tz, await txt("جميع الأوقات بتوقيت الرياض (Asia/Riyadh، UTC+3) وتُحسب على الخادم.", "Body/M", "ink-2")); add(s, tz)
    chk("tz icon", "info", "paper", 3)
  }), "h")
  add(body, await formSection("الأيام المغلقة", "أغلق أيامًا محددة للتوصيل والاستلام (إجازات، أعياد، ظروف تشغيلية).", false, async s => {
    const r = frame("calendar row", { dir: "HORIZONTAL", gap: 32 })
    const cal = frame("calendar", { gap: 12, cross: "CENTER" })
    add(cal, await monthNav(416, "نوفمبر 2026"))
    const closed = [13, 20, 23, 27]
    add(cal, await monthGrid(56, 44, 4, d => closed.includes(d) ? "off" : d === 10 ? "today" : d < 10 ? "past" : "avail"))
    add(r, cal)
    const side = frame("side", { gap: 16, w: 300 })
    add(side, await legend(300, "paper"))
    add(side, await txt("الأيام المغلقة هذا الشهر", "Label/M", "ink", { w: 300 }), "h")
    for (const t of ["الجمعة 13 نوفمبر · عطلة أسبوعية", "الجمعة 20 نوفمبر · عطلة أسبوعية", "الاثنين 23 نوفمبر · جرد المخزون", "الجمعة 27 نوفمبر · عطلة أسبوعية"]) {
      const li = frame("closed day", { dir: "HORIZONTAL", w: 300, h: 44, cross: "CENTER", main: "SPACE_BETWEEN" })
      add(li, await txt(t, "Body/M", "ink-2", { w: 252 })); add(li, await icon("x", 20, "ink-2")); add(side, li)
    }
    add(side, await button("إضافة يوم مغلق", "secondary", "default", "S"))
    add(r, side); add(s, r)
  }), "h")
  add(body, await formSection("فترات التوصيل", "فترة توصيل يومية واحدة، وعدد الأيام المتاحة للحجز المسبق.", false, async s => {
    const r1 = frame("r1", { dir: "HORIZONTAL", gap: 24 })
    add(r1, await field("بداية فترة التوصيل", "16:00", "filled", "بتوقيت الرياض")); add(r1, await field("نهاية فترة التوصيل", "18:00", "filled", "بتوقيت الرياض")); add(s, r1)
    const r2 = frame("r2", { dir: "HORIZONTAL", gap: 24 })
    add(r2, await field("عدد الأيام المتاحة للحجز", "7", "filled", "تظهر للعميل في شريط الأيام"))
    const pv = frame("preview", { w: 342, gap: 8 }); add(pv, await txt("ما يراه العميل", "Label/M", "ink-2", { w: 342 }), "h")
    add(pv, await windowCard(342, "يصل بين 4 و 6 مساءً", "بتوقيت الرياض")); add(r2, pv); add(s, r2)
  }), "h")
  const fa = inst("form-actions")
  await retext(fa, "حفظ", "حفظ التغييرات")
  const del = fa.findOne(n => n.type === "INSTANCE" && n.findOne(t => t.type === "TEXT" && t.characters === "حذف المنتج"))
  if (del) del.visible = false
  add(body, fa, "h")
}
function fitH(screen, body) {
  const last = body.children[body.children.length - 1]
  screen.resize(1440, Math.max(1024, Math.ceil(last.absoluteBoundingBox.y + last.height - screen.absoluteBoundingBox.y + 48)))
}
const adm = state => dashScreen({ path: "Operations/Settings", role: "admin", title: "الإعدادات التشغيلية", crumb: "الإعدادات / التشغيل", state, actions: false, h: 3200 })
const panelWrap = (kind, ttl, bodyText) => async body => {
  const wrap = frame("panel wrap", { dir: "HORIZONTAL", w: 1132, py: 48, main: "CENTER", cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  const p = inst("state-panel", { kind })
  await retext(p, kind === "error" ? "حدث خطأ غير متوقع" : "ليست لديك صلاحية", ttl)
  if (bodyText) await retext(p, kind === "error" ? "تعذّر تحميل البيانات. حاول مرة أخرى." : "تواصل مع مدير الحساب للحصول على الوصول.", bodyText)
  add(wrap, p); add(body, wrap, "h")
}
const aDef = await adm("Default"); await adminBody(aDef.body, false); fitH(aDef.screen, aDef.body)

// paused + confirm dialog: clones of the default page with the pause card swapped
const aPaused = stateCopy(aDef, "Paused", true)
{ aPaused.body.children[0].remove(); const pc = await pauseCard(true); aPaused.body.insertChild(0, pc); pc.layoutSizingHorizontal = "FILL"; fitH(aPaused.screen, aPaused.body) }
const aConfirm = stateCopy(aDef, "Confirm pause", true)
{
  const s = aConfirm.screen
  const scrim = rect("scrim", 1440, s.height, "ink", null, { alpha: 0.5 }); s.appendChild(scrim); scrim.layoutPositioning = "ABSOLUTE"; scrim.x = 0; scrim.y = 0
  const dlg = inst("dialog", { type: "destructive" })
  await retext(dlg, "حذف العنوان؟", "إيقاف استقبال الطلبات؟")
  await retext(dlg, "لن تتمكن من استرجاع هذا العنوان بعد الحذف.", "ستظهر رسالة الإيقاف للعملاء فورًا ولن يتمكنوا من إكمال الطلب حتى تستأنف الاستقبال.")
  await retext(dlg, "حذف", "إيقاف الآن")
  s.appendChild(dlg); dlg.layoutPositioning = "ABSOLUTE"; dlg.x = Math.round((1440 - dlg.width) / 2); dlg.y = 240
}
const aLoad = await adm("Loading")
for (const h of [200, 400, 280, 440, 320]) add(aLoad.body, rect("skeleton", 1132, h, "sand", "md"), "h")
fitH(aLoad.screen, aLoad.body)
const aErr = await adm("Error"); await panelWrap("error", "تعذّر تحميل الإعدادات التشغيلية")(aErr.body); fitH(aErr.screen, aErr.body)
const aVal = await adm("Validation error"); await adminBody(aVal.body, true); fitH(aVal.screen, aVal.body)
const aDen = await adm("Permission denied"); await panelWrap("denied", "ليست لديك صلاحية تعديل الإعدادات التشغيلية")(aDen.body); fitH(aDen.screen, aDen.body)
await screenSection(ctx, PA, "sec-sch-ops-settings", "الإعدادات التشغيلية · Operations settings", async S => {
  S.main.push(aDef.screen)
  S.states.push(aPaused.screen, aConfirm.screen, aLoad.screen, aErr.screen, aVal.screen, aDen.screen)
})

print("✅ SCH web + admin done (prototype links not wired)\n" + ctx.ids.join("\n") + "\n" + contrastReport())
