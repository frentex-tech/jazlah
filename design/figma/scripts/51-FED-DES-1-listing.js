// FED-DES-1 batch 2: listing detail (mobile + web), post/edit listing, seller application, my listings. Arabic RTL, components via _ds.js.
await loadDS()
const ctx = { y: 0 }
const P = "10 Customer App", PW = "20 Customer Web"
const KD = { orders: ["لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب"], search: ["لا توجد نتائج", "جرّب كلمات أخرى أو غيّر عوامل التصفية.", "مسح التصفية"], error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], denied: ["ليست لديك صلاحية", "تواصل مع مدير الحساب للحصول على الوصول.", "رجوع"] }
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
const chips = async (labels, sel, w = 358) => row(await Promise.all(labels.map((l, i) => chip(l, sel.includes(i) ? "selected" : "default"))), w, { gap: 8, clip: true })
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
chk("brand on bg", "brand", "bg"); chk("ink on success-bg", "ink", "sand")
const L = LST[0], UNITS = ["كيس 50 كجم", "حزمة 20 كجم", "بالة 15 كجم", "طن"]
const note = async (text, w, bgk = "danger-bg", ic = "warning", col = "danger") => { const n = frame("notice", { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, cross: "CENTER", fill: bgk, r: "md" }); add(n, await icon(ic, 24, col)); add(n, await txt(text, "Body/M", "ink", { w: w - 76 }), "h"); return n }
const kv = async (k, v, w) => row([await txt(k, "Body/M", "ink-2"), await txt(v, "Label/M", "ink")], w, { main: "SPACE_BETWEEN", cross: "CENTER" })

// ---- Listing detail -----------------------------------------------------------------------------------------------------
async function seller(w) {
  const c = frame("seller", { dir: "HORIZONTAL", w, pad: 16, gap: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  const av = frame("avatar", { dir: "HORIZONTAL", w: 48, h: 48, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" }); add(av, await icon("storefront", 24, "brand")); add(c, av)
  const t = frame("text", { gap: 4 }); add(t, await txt("مؤسسة وادي الخير للأعلاف", "Heading/H3", "ink", { w: w - 140 }), "h"); add(t, await txt("عضو منذ مارس 2026 · الخرج", "Body/M", "ink-2", { w: w - 140 }), "h"); add(c, t, "h")
  add(c, await bdg("success", "بائع معتمد")); return c
}
async function info(w) {
  const f = frame("info", { w, gap: 16 })
  add(f, await txt(L[0], "Heading/H1", "ink", { w }), "h"); add(f, row([await bdg("neutral", "برسيم"), await bdg("success", "متوفر")], w, { gap: 8 }), "h")
  const pr = frame("price", { w, gap: 4 }); add(pr, await txt("38.00 ر.س", "Display/L", "brand", { w }), "h"); add(pr, await txt("لكل حزمة 20 كجم · 1.90 ر.س للكجم", "Body/M", "ink-2", { w }), "h"); add(f, pr, "h")
  const d = frame("details", { w, pad: 16, gap: 12, fill: "paper", stroke: "line", r: "md" })
  for (const [k, v] of [["الكمية المتاحة", "120 حزمة"], ["الحد الأدنى للطلب", "10 حزم"], ["التوصيل", "داخل الخرج والرياض"], ["تاريخ النشر", "قبل يومين"]]) add(d, await kv(k, v, w - 32), "h")
  add(f, d, "h"); add(f, await seller(w), "h"); return f
}
const thumbs = async (w, tw, th) => row(await Promise.all(["sheep", "camel-calf", "lamb-raw", "dryage"].map(k => photo(tw, th, k, "photo thumb", "sm"))), w, { gap: w > 400 ? 20 : 12, main: "SPACE_BETWEEN" })
async function detail(b, o = {}) {
  add(b, await photo(358, 260, "sheep", "gallery", "lg"), "h"); add(b, await thumbs(358, 80, 64), "h"); add(b, await info(358), "h")
  add(b, await txt("برسيم حجازي درجة أولى، مجفّف ومحفوظ في مخزن مغطّى، مناسب للأغنام والإبل. التسليم من المزرعة أو التوصيل داخل الخرج والرياض.", "Body/M", "ink", { w: 358 }), "h")
  const m = await photo(358, 120, "map", "map", "md"); add(b, m, "h")
  add(b, await txt("الموقع: الخرج، يبعد 12 كم عن موقعك", "Body/M", "ink-2", { w: 358 }), "h"); add(b, await button("إبلاغ عن الإعلان", "ghost", "default", "S"))
  const bar = frame("contact bar", { dir: "HORIZONTAL", w: 390, pad: 16, gap: 12, fill: "paper", stroke: "line", cross: "CENTER" })
  if (o.blocked) { add(bar, await note("قمت بحظر هذا البائع، ولا يمكنك مراسلته.", 242, "danger-bg"), "h"); add(bar, await button("إلغاء الحظر", "secondary", "default", "S")) }
  else { add(bar, await button("ابدأ محادثة", "primary"), "h"); add(bar, await button("اتصال", "secondary"), "h") }
  add(b.parent, bar, "h")
}
const det = await mk("Feed/Listing", { type: "page", title: "تفاصيل الإعلان" }, null, {
  Default: [detail, true], Blocked: [b => detail(b, { blocked: true }), true],
  Loading: async b => { add(b, rect("gallery skeleton", 358, 260, "sand", "lg"), "h"); add(b, await skeletonRows(4), "h") },
  Removed: async b => mid(b, await panel("search", "الإعلان لم يعد متاحًا", "حذفه البائع أو انتهت مدته. تصفّح إعلانات مشابهة.", "تصفّح الإعلانات", "prohibit")),
  Error: async b => mid(b, await panel("error", "تعذّر تحميل الإعلان", "حدث خطأ أثناء جلب تفاصيل الإعلان. حاول مرة أخرى.")),
})
{ ctx.y = await startY(P, ["sec-fed-listing", "sec-fed-post", "sec-fed-seller", "sec-fed-mine"]) }
await sec("sec-fed-listing", "تفاصيل الإعلان · Listing detail", det)

// ---- Post / edit listing ---------------------------------------------------------------------------------------------------
const up = async (label, w = 100) => { const t = frame("upload tile", { w, h: 100, main: "CENTER", cross: "CENTER", gap: 4, stroke: "ink-2", r: "md" }); t.dashPattern = [6, 4]; add(t, await icon("camera", 24, "ink-2")); add(t, await txt(label, "Caption", "ink-2", { align: "CENTER" })); return t }
const post = (st, o = {}) => async b => { // st: default|filled|error
  const f = st === "filled"
  add(b, await grp("صور الإعلان (حتى 5)", row([...(f ? await Promise.all(["sheep", "camel-calf", "lamb-raw"].map(k => photo(100, 100, k, "photo thumb", "sm"))) : []), await up("أضف صورة")], 358, { gap: 8 })), "h")
  add(b, await grp("نوع العلف", await chips(TYPES.slice(1), f ? [2] : [])), "h")
  add(b, await fx("عنوان الإعلان", "مثال: برسيم حجازي درجة أولى", L[0], st === "error" ? "default" : st, "اذكر النوع والجودة", ""), "h")
  add(b, await fx("الكمية المتاحة", "مثال: 120", "120", st, "عدد الوحدات المتاحة للبيع", "الكمية مطلوبة"), "h")
  add(b, await grp("الوحدة", await chips(UNITS, f ? [1] : [])), "h")
  add(b, await fx("السعر لكل وحدة (ر.س)", "مثال: 38.00", "38.00", st, "السعر بالريال السعودي بدون ضريبة", "السعر مطلوب"), "h")
  add(b, await grp("المدينة", await chips(["الخرج", ...CITIES], f ? [0] : [])), "h")
  const sw = inst("switch", { checked: f ? "yes" : "no", state: "default" }); await retext(sw, "إضافة تغليف هدية", "أوفّر التوصيل"); add(b, sw, "h")
  add(b, await button(o.edit ? "حفظ التعديلات" : "نشر الإعلان", "primary", o.btn || (f ? "default" : "disabled")), "h")
}
const mkPost = (edit, states) => mk(edit ? "Feed/EditListing" : "Feed/PostListing", { type: "page", title: edit ? "تعديل الإعلان" : "نشر إعلان" }, null, states)
const create = await mkPost(false, {
  Default: [post("default"), true], Error: [post("error"), true], Loading: [post("filled", { btn: "loading" }), true],
  Denied: async b => mid(b, await panel("denied", "حسابك غير معتمد كبائع", "قدّم طلب التسجيل كبائع أعلاف، وبعد موافقة الإدارة تنشر إعلاناتك.", "قدّم طلب التسجيل")),
})
const edit = await mkPost(true, { Default: [post("filled", { edit: true }), true], Saving: [post("filled", { edit: true, btn: "loading" }), true] })
await sec("sec-fed-post", "نشر وتعديل إعلان · Post / edit listing", [create[0], edit[0], create[1], create[2], edit[1], create[3]], 2)

// ---- Seller application -------------------------------------------------------------------------------------------------
const sapp = (st, btn) => async b => {
  const f = st === "filled"
  add(b, await titleBlock("سجّل كبائع أعلاف", "تراجع الإدارة بيانات نشاطك قبل نشر أي إعلان."), "h")
  add(b, await fx("اسم النشاط", "مثال: مؤسسة الواحة للأعلاف", "مؤسسة وادي الخير للأعلاف", st, "كما هو في السجل التجاري", "اسم النشاط مطلوب"), "h")
  add(b, await fx("رقم السجل التجاري", "10 أرقام", "1010456789", st, "رقم السجل المكوّن من 10 أرقام", "أدخل رقم سجل صحيح من 10 أرقام"), "h")
  add(b, await grp("المدينة", await chips(["الخرج", ...CITIES], f ? [0] : [])), "h")
  add(b, await grp("أنواع الأعلاف التي تبيعها", await chips(TYPES.slice(1), f ? [0, 2] : [])), "h")
  if (f) { const r = frame("file", { dir: "HORIZONTAL", w: 358, pad: 12, gap: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" }); add(r, await icon("file-text", 24, "ink")); add(r, await txt("سجل-تجاري.pdf · 1.2 ميجابايت", "Body/M", "ink", { w: 250 }), "h"); add(r, await icon("check-circle", 24, "success", "fill")); add(b, await grp("صورة السجل التجاري", r), "h") }
  else add(b, await grp("صورة السجل التجاري", await up("ارفع صورة أو ملف PDF", 358)), "h")
  if (st === "error") add(b, await note("أرفق صورة السجل التجاري لإكمال الطلب.", 358), "h")
  add(b, await button("إرسال الطلب", "primary", btn || (f ? "default" : "disabled")), "h")
}
const done = (t, x, c, ic) => async b => mid(b, await panel("orders", t, x, c, ic))
const sa = await mk("Feed/SellerApplication", { type: "page", title: "التسجيل كبائع" }, null, {
  Default: [sapp("default"), true], Filled: [sapp("filled"), true], Error: [sapp("error"), true], Loading: [sapp("filled", "loading"), true],
  Pending: done("طلبك قيد المراجعة", "تراجع الإدارة بيانات نشاطك خلال يومي عمل، ونخطرك عند الموافقة.", "العودة لسوق الأعلاف", "hourglass"),
  Rejected: done("لم نتمكن من اعتماد طلبك", "صورة السجل التجاري غير واضحة. أعد رفع صورة أوضح ثم أرسل الطلب.", "تعديل الطلب", "x-circle"),
  Blocked: async b => mid(b, await panel("denied", "لا يمكنك التسجيل كبائع", "قُيّد حسابك بسبب مخالفات سابقة. تواصل مع الدعم لمراجعة الحالة.", "تواصل مع الدعم")),
})
await sec("sec-fed-seller", "طلب التسجيل كبائع · Seller application", sa)

// ---- My listings --------------------------------------------------------------------------------------------------------
async function mycard(l, badge, stats, rejected) {
  const w = frame("mine", { w: 358, gap: 8 }); add(w, await lcard(l), "h")
  add(w, row([badge, await txt(stats, "Body/M", "ink-2", { w: 240 })], 358, { gap: 8, cross: "CENTER" }), "h")
  if (rejected) add(w, await note("سبب الرفض: الصور غير واضحة. عدّلها وأعد الإرسال.", 358), "h")
  add(w, row([await button(rejected ? "تعديل وإعادة الإرسال" : "تعديل", "secondary", "default", "S"), ...(rejected ? [] : [await button("إيقاف", "ghost", "default", "S")])], 358, { gap: 8 }))
  return w
}
const tabsFor = async (i) => { const t = inst("tabs", { active: String(i) }); await retext(t, "الوصف", "منشورة (3)"); await retext(t, "المكوّنات", "قيد المراجعة (1)"); await retext(t, "التقييمات", "مرفوضة (1)"); return t }
const mine = i => async b => {
  add(b, await tabsFor(i), "h")
  if (i === 1) for (const [l, s] of [[LST[0], "42 مشاهدة · 6 محادثات"], [LST[1], "18 مشاهدة · 2 محادثات"], [LST[3], "9 مشاهدات · محادثة واحدة"]]) add(b, await mycard(l, await bdg("success", "منشور"), s), "h")
  if (i === 2) add(b, await mycard(LST[2], await bdg("info", "قيد المراجعة"), "أُرسل قبل ساعة"), "h")
  if (i === 3) add(b, await mycard(LST[5], await bdg("danger", "مرفوض"), "أُرسل أمس", true), "h")
  add(b, await button("إعلان جديد", "primary"), "h")
}
const my = await mk("Feed/MyListings", { type: "page", title: "إعلاناتي" }, "4", {
  Default: [mine(1), true], Review: mine(2), Rejected: mine(3),
  Loading: async b => { add(b, rect("tabs skeleton", 358, 48, "sand", "pill"), "h"); for (let i = 0; i < 3; i++) add(b, skRow(), "h") },
  Empty: async b => mid(b, await panel("search", "لم تنشر أي إعلان بعد", "انشر أول إعلان لعلفك ليصل إلى المشترين القريبين منك.", "نشر إعلان", "grains")),
  Error: async b => mid(b, await panel("error", "تعذّر تحميل إعلاناتك", "حدث خطأ أثناء جلب إعلاناتك. حاول مرة أخرى.")),
  Denied: async b => mid(b, await panel("denied", "حسابك غير معتمد كبائع", "قدّم طلب التسجيل كبائع أعلاف لتتمكن من نشر إعلاناتك.", "قدّم طلب التسجيل")),
})
await sec("sec-fed-mine", "إعلاناتي · My listings", my)

// ---- Web: listing detail (page 20) ---------------------------------------------------------------------------------------
async function wdetail(b) {
  add(b, await txt("سوق الأعلاف / برسيم / برسيم حجازي درجة أولى", "Body/M", "ink-2", { w: 1200 }), "h")
  const g = frame("gallery col", { w: 700, gap: 20 }); add(g, await photo(700, 440, "sheep", "gallery", "lg")); add(g, await thumbs(700, 160, 100))
  const c = frame("info card", { w: 460, pad: 24, gap: 16, fill: "paper", stroke: "line", r: "lg" }); add(c, await info(412), "h")
  add(c, await button("ابدأ محادثة مع البائع", "primary"), "h"); add(c, await button("اتصال بالبائع", "secondary"), "h"); add(c, await button("إبلاغ عن الإعلان", "ghost", "default", "S"))
  add(b, row([g, c], 1200, { gap: 40, cross: "MIN" }), "h")
}
const web = await webScreen({ path: "Feed/Listing", active: 1 }); await wdetail(web.body)
const wl = stateCopy(web, "Loading"), wr = stateCopy(web, "Removed"), we = stateCopy(web, "Error")
add(wl.body, row([frame("g", { w: 700 }), frame("i", { w: 460 })], 1200, { gap: 40 }), "h")
{ const r = wl.body.children[0]; add(r.children[1], rect("gallery skeleton", 700, 440, "sand", "lg")); add(r.children[0], await skeletonRows(4)) }
for (const [w, k, t, x, c, ic] of [[wr, "search", "الإعلان لم يعد متاحًا", "حذفه البائع أو انتهت مدته. تصفّح إعلانات مشابهة.", "تصفّح الإعلانات", "prohibit"], [we, "error", "تعذّر تحميل الإعلان", "حدث خطأ أثناء جلب تفاصيل الإعلان. حاول مرة أخرى.", null, null]]) { const p = frame("center", { dir: "HORIZONTAL", w: 1200, main: "CENTER" }); p.appendChild(await panel(k, t, x, c, ic)); add(w.body, p, "h") }
ctx.y = await startY(PW, ["sec-fed-web-listing"])
await screenSection(ctx, PW, "sec-fed-web-listing", "تفاصيل الإعلان على الويب · Listing detail web", async S => { S.main.push(web.screen); S.states.push(wl.screen, wr.screen, we.screen) })

print("✅ FED listing done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
