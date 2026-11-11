// FED-DES-1 batch 3: conversations list, chat screen (text, images), report / block flows. Page 10 Customer App. Arabic RTL, components via _ds.js.
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

chk("paper on brand", "paper", "brand"); chk("danger on bg", "danger", "bg"); chk("muted on paper", "muted", "paper"); chk("ink on warning-bg", "ink", "warning-bg"); chk("ink on danger-bg", "ink", "danger-bg")
const SELLER = "مؤسسة وادي الخير للأعلاف"
const CHATS = [[SELLER, "برسيم حجازي درجة أولى", "هل التوصيل متاح إلى الرياض غدًا؟", "10:42 ص", "2", "sheep"], ["سلطان القحطاني", "شعير مطحون للإبل", "تمام، أرسل لك الصور الآن", "أمس", "", "camel"], ["مزارع النخيل للأعلاف", "علف أغنام مركّز", "السعر 135.00 ر.س للكيس", "الأحد", "", "lamb-raw"], ["عبدالله الشمري", "تبن قمح مكبوس", "شكرًا، سأتواصل معك الأسبوع القادم", "السبت", "", "camel-saddle"]]
async function crow(c) {
  const r = frame("conversation", { dir: "HORIZONTAL", w: 358, pad: 12, gap: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  add(r, await photo(56, 56, c[5], "photo thumb", "sm"))
  const t = frame("text", { gap: 4 }); add(t, await txt(c[0], "Heading/H3", "ink", { w: 190 }), "h"); add(t, await txt(c[1], "Body/M", "ink-2", { w: 190 }), "h"); add(t, await txt(c[2], "Body/M", c[4] ? "ink" : "ink-2", { w: 190 }), "h"); add(r, t, "h")
  const m = frame("meta", { gap: 8, cross: "MAX" }); add(m, await txt(c[3], "Caption", "ink-2")); if (c[4]) add(m, await bdg("brand", c[4])); add(r, m); return r
}
const list = await mk("Feed/Conversations", { type: "page", title: "المحادثات" }, "2", {
  Default: async b => { for (const c of CHATS) add(b, await crow(c), "h") },
  Loading: async b => { for (let i = 0; i < 5; i++) add(b, skRow(), "h") },
  Empty: async b => mid(b, await panel("search", "لا توجد محادثات بعد", "ابدأ محادثة من صفحة أي إعلان لتسأل البائع عن الكمية والتوصيل.", "تصفّح الإعلانات", "chats-circle")),
  Error: async b => mid(b, await panel("error", "تعذّر تحميل المحادثات", "حدث خطأ أثناء جلب محادثاتك. حاول مرة أخرى.")),
})
{ ctx.y = await startY(P, ["sec-fed-chat-list", "sec-fed-chat", "sec-fed-chat-safety"]) }
await sec("sec-fed-chat-list", "قائمة المحادثات · Conversations", list)

// ---- Chat screen ----------------------------------------------------------------------------------------------------------
async function bubble(me, text, time, o = {}) {
  const w = frame("message", { dir: "HORIZONTAL", w: 358, main: me ? "MAX" : "MIN" })
  const b = frame("bubble", { pad: o.img ? 4 : 12, gap: 4, fill: me ? "brand" : "paper", stroke: me ? null : "line", r: "md", cross: "MAX" }), tc = me ? "paper" : "ink"
  if (o.img) add(b, await photo(212, 150, o.img, "photo chat image", "sm")); else add(b, await txt(text, "Body/M", tc, text.length > 26 ? { w: 236 } : {}))
  const ft = frame("foot", { dir: "HORIZONTAL", gap: 8, px: o.img ? 8 : 0, cross: "CENTER" }); if (o.img) add(ft, await txt(text, "Body/M", tc, { w: 150 })); add(ft, await txt(time, "Caption", me ? "paper" : "ink-2")); add(b, ft)
  add(w, b); return w
}
async function chatBody(b, o = {}) {
  const ctxbar = frame("listing", { dir: "HORIZONTAL", w: 358, pad: 12, gap: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  add(ctxbar, await photo(48, 48, "sheep", "photo thumb", "sm")); const t = frame("text", { gap: 4 }); add(t, await txt("برسيم حجازي درجة أولى", "Label/M", "ink", { w: 220 }), "h"); add(t, await txt("38.00 ر.س / حزمة 20 كجم", "Body/M", "ink-2", { w: 220 }), "h"); add(ctxbar, t, "h")
  const mn = frame("menu", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER" }); add(mn, await icon("dots-three-vertical", 24, "ink")); add(ctxbar, mn); add(b, ctxbar, "h")
  if (!o.empty) {
  add(b, await txt("اليوم", "Caption", "ink-2", { w: 358, align: "CENTER" }), "h")
  add(b, await bubble(true, "السلام عليكم، هل البرسيم الحجازي ما زال متوفرًا؟", "10:31 ص"), "h")
  add(b, await bubble(false, "وعليكم السلام، نعم متوفر 120 حزمة.", "10:33 ص"), "h")
  add(b, await bubble(false, "صورة المخزن اليوم", "10:34 ص", { img: "sheep" }), "h")
  add(b, await bubble(true, o.sending ? "صورة الشحنة" : "أحتاج 40 حزمة. هل التوصيل متاح إلى الرياض غدًا؟", o.sending ? "جارٍ الرفع…" : "10:41 ص", o.sending ? { img: "dryage" } : {}), "h")
  if (o.failed) { const f = frame("failed", { dir: "HORIZONTAL", w: 358, gap: 8, cross: "CENTER", main: "MAX" }); add(f, await icon("warning", 20, "danger")); add(f, await txt("لم تُرسل الرسالة · أعد المحاولة", "Body/M", "danger")); add(b, f, "h") }
  }
  const bar = frame("composer", { dir: "HORIZONTAL", w: 390, pad: 12, gap: 8, cross: "CENTER", fill: "paper", stroke: "line" })
  if (o.mode === "blocked") { add(bar, await note("قمت بحظر هذا المستخدم، ولا يمكنك مراسلته.", 242, "danger-bg"), "h"); add(bar, await button("إلغاء الحظر", "secondary", "default", "S")) }
  else if (o.mode === "removed") add(bar, await note("هذا الإعلان لم يعد متاحًا. المحادثة للقراءة فقط.", 358, "warning-bg", "clock", "ink"), "h")
  else {
    const ib = frame("attach", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER" }); add(ib, await icon("image", 24, "ink")); add(bar, ib)
    const pill = frame("input", { dir: "HORIZONTAL", h: 44, px: 16, cross: "CENTER", fill: "bg", stroke: "line", r: "pill" }); add(pill, await txt("اكتب رسالتك", "Body/M", "muted")); add(bar, pill, "h")
    const sd = frame("send", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "brand", r: "pill" }); add(sd, await icon("paper-plane-tilt", 20, "paper", "fill")); add(bar, sd)
  }
  add(b.parent, bar, "h")
}
async function note(text, w, bgk = "danger-bg", ic = "warning", col = "danger") { const n = frame("notice", { dir: "HORIZONTAL", w, px: 16, py: 12, gap: 12, cross: "CENTER", fill: bgk, r: "md" }); add(n, await icon(ic, 24, col)); add(n, await txt(text, "Body/M", "ink", { w: w - 76 }), "h"); return n }
const chat = await mk("Feed/Chat", { type: "page", title: SELLER }, null, {
  Default: [b => chatBody(b), true], Sending: [b => chatBody(b, { sending: true }), true], Failed: [b => chatBody(b, { failed: true }), true],
  Blocked: [b => chatBody(b, { mode: "blocked" }), true], ListingRemoved: [b => chatBody(b, { mode: "removed" }), true],
  Loading: async b => { for (const [i, w] of [[1, 220], [0, 260], [0, 180], [1, 240]]) add(b, row([rect("bubble skeleton", w, 48, "sand", "md")], 358, { main: i ? "MAX" : "MIN" }), "h") },
  Empty: async b => { await chatBody(b, { empty: true }); mid(b, await panel("search", "ابدأ المحادثة", "اسأل البائع عن الكمية أو موعد التسليم. الرسائل تبقى داخل جزلة.", "اسأل عن التوفر", "chat-circle-text")) },
  Error: async b => mid(b, await panel("error", "تعذّر تحميل المحادثة", "حدث خطأ أثناء جلب الرسائل. حاول مرة أخرى.")),
})
await sec("sec-fed-chat", "شاشة المحادثة · Chat", chat, 1, "ملاحظة تصميم: الرسائل المرسلة على اليسار بلون العلامة، والمستلمة على اليمين؛ الصور تُرفع من أيقونة الصورة بجانب الحقل.")

// ---- Report / block ----------------------------------------------------------------------------------------------------------
async function sheetScreen(state, o) {
  const m = await mobileScreen({ path: o.path || "Feed/Chat/Safety", state, header: { type: "page", title: o.listing ? "تفاصيل الإعلان" : SELLER } })
  if (o.listing) { add(m.body, await photo(358, 260, "sheep", "gallery", "lg"), "h"); add(m.body, await txt("برسيم حجازي درجة أولى", "Heading/H1", "ink", { w: 358 }), "h") } else await chatBody(m.body)
  dim(m.screen)
  if (o.dialog) { const d = inst("dialog", { type: "destructive" }); await retext(d, "حذف العنوان؟", "حظر هذا المستخدم؟"); await retext(d, "لن تتمكن من استرجاع هذا العنوان بعد الحذف.", "لن يتمكن من مراسلتك، ولن ترى رسائله وإعلاناته. يمكنك إلغاء الحظر لاحقًا من الإعدادات."); await retext(d, "حذف", "حظر"); overlay(m.screen, d, 35, 300); return m.screen }
  let s = inst("bottom-sheet"); await retext(s, "اختر الحجم", o.title); await retext(s, "اطلب الآن", o.cta)
  s = await slot(s, "content", async c => {
    c.fills = []; c.primaryAxisSizingMode = "AUTO"; c.itemSpacing = 12; c.counterAxisAlignItems = "MIN"
    if (o.menu) for (const [ic, tx, col] of [["flag", "إبلاغ عن المحادثة", "ink"], ["prohibit", "حظر المستخدم", "danger"]]) { const r = frame("option", { dir: "HORIZONTAL", w: 342, h: 56, gap: 12, cross: "CENTER" }); add(r, await icon(ic, 24, col)); add(r, await txt(tx, "Body/L", "ink")); add(c, r, "h") }
    if (o.reasons) { add(c, await txt("لماذا تبلّغ؟", "Label/M", "ink", { w: 342 }), "h"); for (const [i, t] of ["محتوى مخالف أو مسيء", "احتيال أو سعر مضلل", "إزعاج أو تحرش", "سبب آخر"].entries()) { const r = inst("radio", { checked: o.sel === i ? "yes" : "no", state: "default" }); await retext(r, "إضافة تغليف هدية", t); add(c, r, "h") } }
    if (o.err) add(c, await note(o.err, 342), "h")
    if (o.done) { const ring = frame("icon", { dir: "HORIZONTAL", w: 88, h: 88, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" }); add(ring, await icon("check-circle", 40, "success", "fill")); c.counterAxisAlignItems = "CENTER"; add(c, ring); add(c, await txt(o.done, "Body/M", "ink-2", { w: 342, align: "CENTER" }), "h") }
  })
  const bt = s.findOne(n => n.type === "INSTANCE" && n.findOne(t => t.type === "TEXT" && t.characters === o.cta)); if (bt && o.btn) bt.setProperties({ state: o.btn })
  overlay(m.screen, s, 0, 844 - s.height); return m.screen
}
chk("ink-2 on paper", "ink-2", "paper"); chk("danger on paper", "danger", "paper"); chk("ink on success-bg", "ink", "sand")
const sf = [await sheetScreen("Menu", { title: "خيارات المحادثة", cta: "إلغاء", menu: true }),
  await sheetScreen("Report", { title: "الإبلاغ عن المحادثة", cta: "إرسال البلاغ", reasons: true, btn: "disabled" }),
  await sheetScreen("ReportSelected", { title: "الإبلاغ عن المحادثة", cta: "إرسال البلاغ", reasons: true, sel: 1 }),
  await sheetScreen("ReportSending", { title: "الإبلاغ عن المحادثة", cta: "إرسال البلاغ", reasons: true, sel: 1, btn: "loading" }),
  await sheetScreen("ReportError", { title: "الإبلاغ عن المحادثة", cta: "إعادة المحاولة", reasons: true, sel: 1, err: "تعذّر إرسال البلاغ. تحقق من اتصالك وحاول مرة أخرى." }),
  await sheetScreen("ReportSent", { title: "وصل بلاغك", cta: "تم", done: "سنراجع المحادثة خلال 24 ساعة. يمكنك أيضًا حظر المستخدم من قائمة الخيارات." }),
  await sheetScreen("BlockConfirm", { dialog: true }),
  await sheetScreen("ReportListing", { path: "Feed/Listing/Report", listing: true, title: "الإبلاغ عن الإعلان", cta: "إرسال البلاغ", reasons: true, sel: 0 })]
await sec("sec-fed-chat-safety", "الإبلاغ والحظر · Report and block", sf, 2)

print("✅ FED chat done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
