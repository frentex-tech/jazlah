// SCH-DES-1 (mobile): checkout step 1 — delivery/pickup, covered address picker, pickup card, day picker (strip + month sheet),
// delivery window, paused banner. Page 10 Customer App. No bottom tab bar in checkout. Arabic RTL, components/templates only.
await loadDS()
const ctx = { y: 0 }
const P = "10 Customer App"
await page(P).loadAsync()
{ const own = ["sec-sch-checkout-m", "sec-sch-day-reasons"]
  const rest = page(P).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }

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

// ---- main checkout screen builder ------------------------------------------------------------------------
// o: mode delivery|pickup, paused, view normal|loading|empty|error, focus (null|closed|full|cutoff), legend
async function checkoutM(state, o = {}) {
  const m = await mobileScreen({ path: "Checkout/Fulfilment", state, header: { type: "page", title: "إتمام الطلب" }, gap: 12 })
  const b = m.body, W = 358, mode = o.mode || "delivery", view = o.view || "normal"
  const pushSpacer = () => { const sp = spacer(); add(b, sp); sp.layoutSizingVertical = "FILL" }
  if (o.paused) add(b, await pausedBanner(W), "h")
  add(b, await stepRow(W), "h")
  add(b, await toggleRow(W, mode), "h")
  if (view === "loading") {
    add(b, await skeletonRows(4), "h"); pushSpacer()
    add(b, await button("متابعة إلى الدفع", "primary", "disabled"), "h")
    return m
  }
  if (view === "empty") {
    const p = inst("state-panel", { kind: "orders" })
    await retext(p, "لا توجد طلبات بعد", "لا يوجد عنوان داخل التغطية")
    await retext(p, "طلباتك السابقة والحالية ستظهر هنا.", "أضف عنوانًا داخل نطاق التغطية لنوصّل لك، أو اختر الاستلام من المتجر.")
    await retext(p, "ابدأ أول طلب", "إضافة عنوان")
    const panel = await slot(p, "icon", async s => add(s, await icon("map-pin", 40, "ink-2")))
    add(b, panel, "h"); pushSpacer()
    add(b, await button("متابعة إلى الدفع", "primary", "disabled"), "h")
    return m
  }
  if (mode === "delivery") {
    add(b, await sectionTitle(W, "عنوان التوصيل"), "h")
    add(b, await addrRow(W, "المنزل · حي الملقا", "الرياض، طريق أنس بن مالك", "sel"), "h")
    add(b, await addrRow(W, "المزرعة · طريق القصيم", "بريدة، خارج نطاق التوصيل الحالي", "off"), "h")
  } else {
    add(b, await sectionTitle(W, "موقع الاستلام"), "h")
    add(b, await pickupCard(W, 56), "h")
  }
  add(b, await sectionTitle(W, mode === "delivery" ? "يوم التوصيل" : "يوم الاستلام", "التقويم"), "h")
  const f = o.focus ? FOCUS[o.focus] : null
  const strip = await stripCells(64, STRIP.slice(0, 5), f ? null : 11, f)
  add(b, strip)
  if (view === "error") {
    add(b, await errorBlock(W), "h")
  } else if (o.focus) {
    add(b, await reasonCard(W, o.focus), "h")
  } else {
    add(b, await windowCard(W, mode === "delivery" ? "يصل بين 4 و 6 مساءً" : "جاهز للاستلام بين 4 و 6 مساءً", "الأربعاء 11 نوفمبر · بتوقيت الرياض"), "h")
    if (o.legend) add(b, await legend(W, "bg"), "h")
  }
  pushSpacer()
  add(b, await button("متابعة إلى الدفع", "primary", o.paused || o.focus || view === "error" ? "disabled" : "default"), "h")
  return m
}

const base = await checkoutM("Default", { legend: true })
const pickup = await checkoutM("Pickup", { mode: "pickup" })

// day sheet: scrim + bottom sheet with the month grid and the legend
const sheetScreen = await checkoutM("Day sheet open", {})
{
  const s = sheetScreen.screen
  const scrim = rect("scrim", 390, 844, "ink", null, { alpha: 0.45 }); s.appendChild(scrim); scrim.layoutPositioning = "ABSOLUTE"; scrim.x = 0; scrim.y = 0
  const sh = inst("bottom-sheet")
  await retext(sh, "اختر الحجم", "اختر يوم التوصيل")
  await retext(sh, "اطلب الآن", "تأكيد اليوم")
  const kindOf = d => d < 10 ? "past" : d === 10 ? "cutoff" : d === 11 ? "sel" : [12, 18].includes(d) ? "full" : [13, 20, 23, 27].includes(d) ? "closed" : "avail"
  const sheet = await slot(sh, "content", async c => {
    c.fills = []; c.primaryAxisSizingMode = "AUTO"; c.primaryAxisAlignItems = "MIN"; c.counterAxisAlignItems = "CENTER"; bind(c, "itemSpacing", 16)
    add(c, await monthNav(332, "نوفمبر 2026"))
    add(c, await monthGrid(44, 44, 4, kindOf))
    add(c, await legend(332, "paper"))
  })
  s.appendChild(sheet); sheet.layoutPositioning = "ABSOLUTE"; sheet.x = 0; sheet.y = 844 - sheet.height
}

const paused = await checkoutM("Paused", { paused: true })
const loading = await checkoutM("Loading", { view: "loading" })
const empty = await checkoutM("Empty", { view: "empty" })
const err = await checkoutM("Error", { view: "error" })
await screenSection(ctx, P, "sec-sch-checkout-m", "الدفع · الخطوة 1: الاستلام واليوم · Checkout step 1", async S => {
  S.main.push(base.screen, pickup.screen, sheetScreen.screen)
  S.states.push(paused.screen, loading.screen, empty.screen, err.screen)
})

// ---- disabled-day reasons: one screen per reason (own copy each) -----------------------------------------------
const rClosed = await checkoutM("Day closed", { focus: "closed" })
const rFull = await checkoutM("Day full", { focus: "full" })
const rCut = await checkoutM("Day past cutoff", { focus: "cutoff" })
await screenSection(ctx, P, "sec-sch-day-reasons", "أسباب تعذّر اليوم · Disabled day reasons", async S => {
  S.main.push(rClosed.screen, rFull.screen, rCut.screen)
})

print("✅ SCH mobile done (prototype links not wired)\n" + ctx.ids.join("\n") + "\n" + contrastReport())
