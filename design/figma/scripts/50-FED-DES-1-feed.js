// FED-DES-1 batch 1: feed home, filters sheet, buy-request board and form (page 10 Customer App) + feed home web (page 20). Arabic RTL, components via _ds.js.
await loadDS()
const ctx = { y: 0 }
const P = "10 Customer App", PW = "20 Customer Web"
const KD = { search: ["لا توجد نتائج", "جرّب كلمات أخرى أو غيّر عوامل التصفية.", "مسح التصفية"], error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], denied: ["ليست لديك صلاحية", "تواصل مع مدير الحساب للحصول على الوصول.", "رجوع"] }
async function startY(pg, own) { await page(pg).loadAsync(); const rest = page(pg).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id"))); return rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }
async function panel(kind, title, text, cta, ic) { // state-panel with Arabic copy; ic swaps the icon
  const p = inst("state-panel", { kind }), d = KD[kind]
  await retext(p, d[0], title); await retext(p, d[1], text); if (cta != null) await retext(p, d[2], cta)
  return ic ? await slot(p, "icon", async f => add(f, await icon(ic, 40, "ink-2"))) : p
}
function mid(b, node, w = 358) { const t = spacer(), u = spacer(); add(b, t); t.layoutSizingVertical = "FILL"; const c = frame("center", { dir: "HORIZONTAL", main: "CENTER", w }); c.appendChild(node); add(b, c, "h"); add(b, u); u.layoutSizingVertical = "FILL" }
function overlay(screen, node, x, y) { screen.appendChild(node); node.layoutPositioning = "ABSOLUTE"; node.x = x; node.y = y }
function dim(screen) { overlay(screen, rect("scrim", screen.width, screen.height, "ink", null, { alpha: 0.5 }), 0, 0) }
const row = (items, w, o = {}) => { const r = frame("row", { dir: "HORIZONTAL", w, gap: o.gap == null ? 12 : o.gap, main: o.main, cross: o.cross, clip: o.clip }); items.forEach(i => add(r, i)); return r }
async function photo(w, h, key, name = "photo", r = "md") { const f = frame(name, { dir: "HORIZONTAL", w, h, main: "CENTER", cross: "CENTER", fill: "sand", r, clip: true }); add(f, await icon("image", 32, "ink-2")); f.setSharedPluginData(NS, "photo", key); return f }
async function bdg(type, label, size = "S") { const b = inst("badge", { type, size }); await retext(b, { neutral: "جديد", info: "قيد المراجعة", warning: "قيد التجهيز", success: "تم التسليم", danger: "ملغي", brand: "ذُبح اليوم" }[type], label); return b }
async function sh(title, link = "الكل") { const s = inst("section-header"); await retext(s, "الأكثر مبيعًا", title); await retext(s, "الكل", link); return s }
const grp = async (label, node, w = 358) => { const g = frame("group", { w, gap: 8 }); add(g, await txt(label, "Label/M", "ink", { w }), "h"); add(g, node, "h"); return g }
const chips = async (labels, sel, w = 358) => { const r = row(await Promise.all(labels.map((l, i) => chip(l, sel.includes(i) ? "selected" : "default"))), w, { gap: 8, clip: true }); r.layoutWrap = "WRAP"; r.counterAxisSpacing = 8; return r } // wrap: 3 price chips are wider than 342
const fx = (label, ph, val, st, hint, err) => field(label, st === "filled" ? val : ph, st, st === "error" ? err : hint)
const skRow = () => { const c = frame("skeleton row", { dir: "HORIZONTAL", w: 358, pad: 12, gap: 12, fill: "paper", stroke: "line", r: "md" }); add(c, rect("photo skeleton", 96, 96, "sand", "sm")); const l = frame("lines", { gap: 8 }); [180, 140, 100].forEach(x => add(l, rect("l", x, 12, "sand", "pill"))); add(c, l); return c }
const skC = w => { const c = frame("skeleton card", { w, fill: "paper", stroke: "line", r: "md", clip: true }); add(c, rect("photo skeleton", w, 200, "sand"), "h"); const l = frame("lines", { pad: 16, gap: 8 }); [200, 260, 120].forEach(x => add(l, rect("l", x, 12, "sand", "pill"))); add(c, l, "h"); return c }
// mobile screen + state copies. states: { Default: fn | [fn, tall], Loading: fn, ... } (first key = base). Returns screens.
async function mk(path, header, tab, states) {
  const base = await mobileScreen({ path, header, tab }), names = Object.keys(states)
  const all = [base, ...names.slice(1).map(n => stateCopy(base, n))]
  for (const [i, n] of names.entries()) { const [fn, t] = [].concat(states[n]); await fn(all[i].body); if (t) scrollify(all[i]) }
  return all.map(x => x.screen)
}
function scrollify(s) { s.body.layoutSizingVertical = "HUG"; s.screen.primaryAxisSizingMode = "AUTO"; s.body.clipsContent = false }
const sec = (id, title, arr, nMain = 1, note) => screenSection(ctx, P, id, title, async S => { S.main.push(...arr.slice(0, nMain)); S.states.push(...arr.slice(nMain)); if (note) S.note = note })
chk("ink on bg", "ink", "bg"); chk("ink-2 on bg", "ink-2", "bg"); chk("ink on paper", "ink", "paper"); chk("ink-2 on paper", "ink-2", "paper"); chk("brand on paper", "brand", "paper"); chk("ink on danger-bg", "ink", "danger-bg")

// ---- data (feed types: علف، شعير، برسيم، تبن) ---------------------------------------------------------------
const LST = [
  ["برسيم حجازي درجة أولى", "برسيم", "38.00", "حزمة 20 كجم", "الخرج", "12 كم", "sheep"],
  ["شعير مطحون للإبل", "شعير", "92.00", "كيس 50 كجم", "الرياض", "4 كم", "camel"],
  ["علف أغنام مركّز", "علف", "135.00", "كيس 50 كجم", "بريدة", "21 كم", "lamb-raw"],
  ["تبن قمح مكبوس", "تبن", "21.00", "بالة 15 كجم", "حائل", "35 كم", "camel-saddle"],
  ["برسيم رودس أخضر", "برسيم", "30.00", "حزمة 20 كجم", "الرياض", "9 كم", "camel-calf"],
  ["علف ماشية حلّاب", "علف", "148.00", "كيس 50 كجم", "الأحساء", "48 كم", "dryage"],
]
const BR = [["مطلوب 5 طن برسيم حجازي", "الرياض", "قبل ساعتين", "منصور العتيبي", "3 ردود"], ["مطلوب 200 كيس شعير", "بريدة", "قبل 5 ساعات", "سلطان القحطاني", "7 ردود"], ["مطلوب 300 بالة تبن قمح", "الدمام", "أمس", "عبدالله الشمري", "رد واحد"]]
const TYPES = ["الكل", "علف", "شعير", "برسيم", "تبن"], CITIES = ["الرياض", "جدة", "الدمام", "بريدة"]
async function lcard(l) {
  const c = frame("listing card", { dir: "HORIZONTAL", w: 358, pad: 12, gap: 12, fill: "paper", stroke: "line", r: "md" })
  add(c, await photo(96, 96, l[6], "photo thumb", "sm"))
  const t = frame("text", { gap: 4 }); const w = 226
  add(t, await txt(l[0], "Heading/H3", "ink", { w }), "h"); add(t, await txt(`${l[4]} · ${l[5]}`, "Body/M", "ink-2", { w }), "h")
  add(t, await txt(`${l[2]} ر.س / ${l[3]}`, "Label/M", "brand", { w }), "h"); add(t, await bdg("neutral", l[1])); add(c, t, "h"); return c
}
async function rcard(r) {
  const c = frame("request card", { w: 358, pad: 16, gap: 8, fill: "paper", stroke: "line", r: "md" })
  const h = frame("head", { dir: "HORIZONTAL", w: 326, gap: 8, cross: "CENTER", main: "SPACE_BETWEEN" })
  add(h, await txt(r[0], "Heading/H3", "ink", { w: 220 })); add(h, await bdg("info", r[4])); add(c, h, "h")
  add(c, await txt(`${r[1]} · ${r[2]} · ${r[3]}`, "Body/M", "ink-2", { w: 326 }), "h"); add(c, await button("أرسل عرضك", "secondary", "default", "S")); return c
}
const filterBtn = async (on) => { const b = frame("filter", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: on ? "brand" : "paper", stroke: "line", r: "pill" }); add(b, await icon("sliders-horizontal", 20, on ? "paper" : "ink")); return b }

// ---- Feed home ------------------------------------------------------------------------------------------------------
async function feedBody(b, o = {}) {
  const s = inst("search-bar", { state: o.q ? "filled" : "default" }); await retext(s, o.q ? "ريب آي" : "ابحث عن لحوم أو متاجر", o.q || "ابحث عن علف أو بائع"); add(b, s, "h")
  add(b, row([await filterBtn(o.sel > 0), await chips(TYPES, [o.sel || 0], 306)], 358, { gap: 8, cross: "CENTER" }), "h")
  const list = o.sel ? LST.filter(l => l[1] === TYPES[o.sel]) : LST.slice(0, 3)
  add(b, await sh(o.sel ? "إعلانات البرسيم في الرياض" : "إعلانات قريبة منك"), "h")
  for (const l of list) add(b, await lcard(l), "h")
  if (!o.sel) { add(b, await sh("طلبات شراء"), "h"); for (const r of BR.slice(0, 2)) add(b, await rcard(r), "h"); add(b, await button("انشر إعلانك", "primary"), "h") }
}
const feed = await mk("Feed/Home", { type: "page", title: "سوق الأعلاف" }, "2", {
  Default: [b => feedBody(b), true],
  Filtered: b => feedBody(b, { sel: 3, q: "برسيم" }),
  Loading: async b => { add(b, rect("search skeleton", 358, 48, "sand", "pill"), "h"); add(b, rect("chips skeleton", 358, 44, "sand", "pill"), "h"); for (let i = 0; i < 4; i++) add(b, skRow(), "h") },
  Empty: async b => mid(b, await panel("search", "لا توجد إعلانات قريبة", "لم نجد إعلانات أعلاف قرب موقعك. جرّب مدينة أخرى أو انشر طلب شراء.", "نشر طلب شراء", "grains")),
  Error: async b => mid(b, await panel("error", "تعذّر تحميل الإعلانات", "حدث خطأ أثناء جلب إعلانات الأعلاف. حاول مرة أخرى.")),
  Offline: async b => mid(b, await panel("error", "لا يوجد اتصال بالإنترنت", "تحقق من اتصالك ثم أعد المحاولة.", "إعادة المحاولة", "wifi-slash")),
})
{ const own = ["sec-fed-home", "sec-fed-filters", "sec-fed-requests", "sec-fed-request-form"]; ctx.y = await startY(P, own) }
await sec("sec-fed-home", "سوق الأعلاف · Feed home", feed, 1, "ملاحظة تصميم: الدفع والتوصيل داخل المنصة مؤجلان بعد الإطلاق؛ التواصل بين المشتري والبائع عبر المحادثة فقط.")

// ---- Filters (bottom sheet over dimmed feed) -----------------------------------------------------------------------
async function sheetScreen(state, o) {
  const m = await mobileScreen({ path: "Feed/Filters", state, header: { type: "page", title: "سوق الأعلاف" }, tab: "2" })
  await feedBody(m.body); dim(m.screen)
  let s = inst("bottom-sheet"); await retext(s, "اختر الحجم", "تصفية الإعلانات"); await retext(s, "اطلب الآن", o.cta)
  s = await slot(s, "content", async c => {
    c.fills = []; c.primaryAxisSizingMode = "AUTO"; c.itemSpacing = 16
    add(c, await grp("نوع العلف", await chips(TYPES, o.t, 342), 342), "h"); add(c, await grp("المدينة", await chips(CITIES, o.c, 342), 342), "h")
    add(c, await grp("السعر", await chips(["أقل من 50 ر.س", "50 – 100 ر.س", "أكثر من 100 ر.س"], o.p, 342), 342), "h")
    const sw = inst("switch", { checked: o.sw ? "yes" : "no", state: "default" }); await retext(sw, "إضافة تغليف هدية", "الإعلانات التي توفّر التوصيل فقط"); add(c, sw, "h")
    if (o.err) { const n = frame("notice", { dir: "HORIZONTAL", w: 342, px: 16, py: 12, gap: 12, cross: "CENTER", fill: "danger-bg", r: "md" }); add(n, await icon("warning", 24, "danger")); add(n, await txt(o.err, "Body/M", "ink", { w: 270 }), "h"); add(c, n, "h") }
    if (o.reset) add(c, await button("مسح التصفية", "ghost"), "h")
  })
  const bt = s.findOne(n => n.type === "INSTANCE" && n.findOne(t => t.type === "TEXT" && t.characters === o.cta)); if (bt && o.btn) bt.setProperties({ state: o.btn })
  overlay(m.screen, s, 0, 844 - s.height); return m.screen
}
const fl = [await sheetScreen("Default", { t: [0], c: [], p: [], cta: "عرض 24 إعلانًا" })]
fl.push(await sheetScreen("Filled", { t: [3], c: [0], p: [1], sw: true, cta: "عرض 6 إعلانات", reset: true }))
fl.push(await sheetScreen("NoResults", { t: [2], c: [1], p: [0], cta: "لا توجد نتائج", btn: "disabled", reset: true }))
fl.push(await sheetScreen("Loading", { t: [3], c: [0], p: [1], sw: true, cta: "عرض 6 إعلانات", btn: "loading" }))
fl.push(await sheetScreen("Error", { t: [3], c: [0], p: [], cta: "إعادة المحاولة", err: "تعذّر حساب عدد النتائج. تحقق من اتصالك." }))
await sec("sec-fed-filters", "تصفية الإعلانات · Filters", fl)

// ---- Buy-request board -----------------------------------------------------------------------------------------------
const board = await mk("Feed/BuyRequests", { type: "page", title: "طلبات الشراء" }, "2", {
  Default: [async b => { add(b, await chips(TYPES, [0]), "h"); for (const r of BR) add(b, await rcard(r), "h"); add(b, await button("انشر طلب شراء", "primary"), "h") }, true],
  Loading: async b => { add(b, rect("chips skeleton", 358, 44, "sand", "pill"), "h"); for (let i = 0; i < 3; i++) add(b, skRow(), "h") },
  Empty: async b => mid(b, await panel("search", "لا توجد طلبات شراء", "لم ينشر أحد طلب شراء قرب موقعك بعد. كن أول من ينشر.", "نشر طلب شراء", "shopping-cart-simple")),
  Error: async b => mid(b, await panel("error", "تعذّر تحميل الطلبات", "حدث خطأ أثناء جلب طلبات الشراء. حاول مرة أخرى.")),
})
await sec("sec-fed-requests", "لوحة طلبات الشراء · Buy-request board", board)

// ---- Buy-request form --------------------------------------------------------------------------------------------------
const bform = (st, btn) => async b => {
  add(b, await titleBlock("اطلب العلف الذي تحتاجه", "يصلك رد البائعين القريبين في المحادثات."), "h")
  add(b, await grp("نوع العلف", await chips(TYPES.slice(1), st === "filled" ? [2] : [])), "h")
  add(b, await fx("الكمية المطلوبة", "مثال: 5 طن", "5 طن", st, "اكتب الكمية مع الوحدة", "الكمية مطلوبة"), "h")
  add(b, await fx("الميزانية للوحدة (اختياري)", "مثال: 1850.00 ر.س / طن", "1850.00 ر.س / طن", st === "error" ? "default" : st, "يساعد البائعين على إرسال عرض مناسب"), "h")
  add(b, await grp("المدينة", await chips(CITIES, st === "filled" ? [0] : [])), "h")
  add(b, await fx("تفاصيل إضافية", "اكتب هنا", "برسيم حجازي جاف، التسليم في مزرعة بالخرج", st === "error" ? "default" : st, "مثل الجودة وموعد الاستلام"), "h")
  add(b, await button("نشر الطلب", "primary", btn || (st === "filled" ? "default" : "disabled")), "h")
}
const bf = await mk("Feed/BuyRequestForm", { type: "page", title: "طلب شراء جديد" }, null, {
  Default: [bform("default"), true], Filled: [bform("filled"), true], Error: [bform("error"), true],
  Loading: bform("filled", "loading"),
  Denied: async b => mid(b, await panel("denied", "النشر موقوف مؤقتًا", "أوقفنا نشر الطلبات في حسابك بسبب بلاغات. تواصل مع الدعم لمراجعة الحالة.", "تواصل مع الدعم")),
})
await sec("sec-fed-request-form", "نموذج طلب شراء · Buy-request form", bf)

// ---- Web: feed home (page 20) ---------------------------------------------------------------------------------------
async function wcard(l) {
  const c = frame("listing card", { w: 384, fill: "paper", stroke: "line", r: "md", clip: true })
  add(c, await photo(384, 200, l[6], "photo cover", "sm"), "h")
  const t = frame("text", { w: 384, pad: 16, gap: 8 })
  add(t, await txt(l[0], "Heading/H3", "ink", { w: 352 }), "h"); add(t, await txt(`${l[4]} · ${l[5]}`, "Body/M", "ink-2", { w: 352 }), "h")
  add(t, await txt(`${l[2]} ر.س / ${l[3]}`, "Label/M", "brand", { w: 352 }), "h"); add(t, await bdg("neutral", l[1])); add(c, t, "h"); return c
}
const wgrid = items => { const g = frame("grid", { w: 1200, gap: 24 }); for (let i = 0; i < items.length; i += 3) add(g, row(items.slice(i, i + 3), 1200, { gap: 24 }), "h"); return g }
const web = await webScreen({ path: "Feed/Home", active: 1 })
add(web.body, await titleBlock("سوق الأعلاف", "تصفّح إعلانات العلف والشعير والبرسيم والتبن القريبة منك، وتواصل مع البائع مباشرة.", "RIGHT", 1200), "h")
add(web.body, await chips(TYPES, [0], 1200), "h")
add(web.body, wgrid(await Promise.all(LST.map(wcard))), "h")
const wl = stateCopy(web, "Loading"), we = stateCopy(web, "Empty"), wr = stateCopy(web, "Error")
for (const w of [wl, we, wr]) { add(w.body, await titleBlock("سوق الأعلاف", "تصفّح إعلانات العلف القريبة منك.", "RIGHT", 1200), "h"); add(w.body, await chips(TYPES, [0], 1200), "h") }
add(wl.body, wgrid([skC(384), skC(384), skC(384)]), "h")
{ const c = frame("center", { dir: "HORIZONTAL", w: 1200, main: "CENTER" }); c.appendChild(await panel("search", "لا توجد إعلانات قريبة", "لم نجد إعلانات أعلاف قرب موقعك. جرّب مدينة أخرى.", "مسح التصفية", "grains")); add(we.body, c, "h") }
{ const c = frame("center", { dir: "HORIZONTAL", w: 1200, main: "CENTER" }); c.appendChild(await panel("error", "تعذّر تحميل الإعلانات", "حدث خطأ أثناء جلب إعلانات الأعلاف. حاول مرة أخرى.")); add(wr.body, c, "h") }
ctx.y = await startY(PW, ["sec-fed-web-home"])
await screenSection(ctx, PW, "sec-fed-web-home", "سوق الأعلاف على الويب · Feed home web", async S => { S.main.push(web.screen); S.states.push(wl.screen, we.screen, wr.screen) })

print("✅ FED feed done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
