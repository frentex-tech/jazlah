// ACC-DES-1 batch 2 (mobile, part b): add address on map, location permission prompt, out-of-coverage state.
// Page 10 Customer App. Components and templates only. Arabic RTL. Prototype links are wired elsewhere.
await loadDS()
const ctx = { y: 0 }
const P = "10 Customer App"
await page(P).loadAsync()
{ const own = ["sec-acc-address-map", "sec-acc-location-permission", "sec-acc-out-of-coverage"]
  const rest = page(P).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }

// ---- shared helpers (duplicated in 12 and 12b: scripts cannot share top-level code beyond _ds.js) ----
const KD = { error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], orders: ["لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب"], denied: ["ليست لديك صلاحية", "تواصل مع مدير الحساب للحصول على الوصول.", "رجوع"] }
// state-panel instance with new copy; ic swaps the icon inside the ring (detaches the instance)
async function panel(kind, title, text, cta, ic, col = "ink-2") {
  const p = inst("state-panel", { kind }), d = KD[kind]
  await retext(p, d[0], title); await retext(p, d[1], text); await retext(p, d[2], cta)
  return ic ? await slot(p, "icon", async f => add(f, await icon(ic, 40, col))) : p
}
// vertically centered node inside a body
function mid(b, node) {
  const t = spacer(), u = spacer(); add(b, t); t.layoutSizingVertical = "FILL"
  const w = frame("center", { dir: "HORIZONTAL", main: "CENTER", w: 358 }); w.appendChild(node); add(b, w, "h")
  add(b, u); u.layoutSizingVertical = "FILL"
}
function fillSp(b) { const s = spacer(); add(b, s); s.layoutSizingVertical = "FILL" }
function overlay(screen, node, x, y) { screen.appendChild(node); node.layoutPositioning = "ABSOLUTE"; node.x = x; node.y = y }
function dim(screen) { overlay(screen, rect("scrim", screen.width, screen.height, "ink", null, { alpha: 0.5 }), 0, 0) }
async function addrCard(name, line, def) {
  const c = frame("address card", { dir: "HORIZONTAL", w: 358, pad: 16, gap: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  const ring = frame("pin", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" }); add(ring, await icon("map-pin", 24, "ink")); add(c, ring)
  const t = frame("text", { gap: 4 })
  const head = frame("head", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" }); add(head, await txt(name, "Heading/H3"))
  if (def) { const bd = inst("badge", { type: "success", size: "S" }); await retext(bd, "تم التسليم", "افتراضي"); add(head, bd) }
  add(t, head); add(t, await txt(line, "Body/M", "ink-2", { w: 210 }))
  add(c, t, "h")
  const e = frame("edit", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER" }); add(e, await icon("pencil-simple", 20, "ink-2")); add(c, e)
  chk("address card title", "ink", "paper"); chk("address card line", "ink-2", "paper")
  return c
}

async function banner(text) {
  const b = frame("banner", { dir: "HORIZONTAL", w: 358, pad: 12, gap: 8, cross: "CENTER", fill: "danger-bg", r: "md" })
  add(b, await icon("warning", 20, "danger")); add(b, await txt(text, "Body/M", "ink", { w: 300 }), "h")
  chk("banner text", "ink", "danger-bg"); chk("banner icon", "danger", "danger-bg", 3)
  return b
}

// ---- Add address on map ----------------------------------------------------------------------------
// o: pin (default|selected), search (default|focused|filled), results, panel: "ok"|"loading"|"outside"|"error"
async function mapScreen(state, o) {
  const m = await mobileScreen({ path: "Addresses/Add", state, header: { type: "page", title: "إضافة عنوان" }, pad: 0, gap: 0 })
  const map = frame("map placeholder", { w: 390, main: "CENTER", cross: "CENTER", fill: "sand" })
  add(m.body, map, "h"); map.layoutSizingVertical = "FILL"
  add(map, await icon("map-trifold", 56, "ink-2"))
  overlay(map, inst("map-pin", { type: "address", state: o.pin }), 165, 190)
  const sb = inst("search-bar", { state: o.search })
  if (o.search === "focused") await retext(sb, "ابحث عن لحوم أو متاجر", "ابحث عن عنوان أو حي")
  if (o.search === "filled") await retext(sb, "ريب آي", "الملقا، الرياض")
  overlay(map, sb, 16, 16)
  if (o.results) {
    const r = frame("results", { w: 358, pad: 8, gap: 4, fill: "paper", stroke: "line", r: "md" })
    for (const t of ["حي الملقا، الرياض", "حي الملقا، شارع أنس بن مالك", "ملقا مول، الرياض"]) {
      const row = frame("result", { dir: "HORIZONTAL", w: 342, h: 44, px: 8, gap: 12, cross: "CENTER" })
      add(row, await icon("map-pin", 20, "ink-2")); add(row, await txt(t, "Body/M", "ink"), "h"); add(r, row, "h")
    }
    chk("search result", "ink", "paper")
    overlay(map, r, 16, 76)
  }
  const pn = frame("address panel", { w: 390, pad: 16, gap: 12, fill: "paper", stroke: "line" })
  if (o.panel === "loading") { add(pn, rect("line 1", 220, 16, "sand", "pill")); add(pn, rect("line 2", 160, 12, "sand", "pill")) }
  else if (o.panel === "error") add(pn, await banner("تعذّر تحديد العنوان لهذا الموقع. حاول مرة أخرى."), "h")
  else {
    const l = frame("location", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" })
    add(l, await icon("map-pin", 20, "ember", "fill")); add(l, await txt("حي الملقا، شارع أنس بن مالك", "Label/M"), "h"); add(pn, l, "h")
    add(pn, await txt("حرّك الخريطة لضبط الدبوس على موقعك.", "Body/M", "ink-2", { w: 358 }), "h")
    if (o.panel === "outside") add(pn, await banner("عذرًا، لا نوصّل إلى هذا الموقع حاليًا."), "h")
  }
  chk("address panel text", "ink", "paper"); chk("address panel caption", "ink-2", "paper")
  add(pn, o.panel === "error" ? await button("إعادة المحاولة") : await button("تأكيد الموقع", "primary", o.panel === "ok" ? "default" : o.panel === "loading" ? "loading" : "disabled"), "h")
  add(m.body, pn, "h")
  return m
}
const mapDef = await mapScreen("Default", { pin: "default", search: "default", panel: "ok" })
const mapSearch = await mapScreen("Searching", { pin: "default", search: "focused", results: true, panel: "ok" })
const mapOut = await mapScreen("Outside coverage", { pin: "selected", search: "filled", panel: "outside" })
const mapLoad = await mapScreen("Loading", { pin: "selected", search: "filled", panel: "loading" })
const mapErr = await mapScreen("Error", { pin: "selected", search: "filled", panel: "error" })
await screenSection(ctx, P, "sec-acc-address-map", "إضافة عنوان على الخريطة · Add address on map", async S => { S.main.push(mapDef.screen); S.states.push(mapSearch.screen, mapOut.screen, mapLoad.screen, mapErr.screen) })

// ---- Location permission prompt (bottom sheet over dimmed screen) ------------------------------------
// o: ic, col, title, text, cta, ghost, loading
async function permScreen(state, o) {
  const m = await mobileScreen({ path: "Location/Permission", state, header: { type: "page", title: "إضافة عنوان" } })
  add(m.body, await skeletonRows(3), "h")
  dim(m.screen)
  let sh = inst("bottom-sheet")
  await retext(sh, "اختر الحجم", o.title); await retext(sh, "اطلب الآن", o.cta)
  sh = await slot(sh, "content", async s => {
    s.fills = []; s.primaryAxisSizingMode = "AUTO"; s.itemSpacing = 12; s.counterAxisAlignItems = "CENTER"
    const ring = frame("icon", { dir: "HORIZONTAL", w: 88, h: 88, main: "CENTER", cross: "CENTER", fill: o.ring || "sand", r: "pill" })
    add(ring, await icon(o.ic, 40, o.col)); add(s, ring)
    add(s, await txt(o.text, "Body/M", "ink-2", { w: 342, align: "CENTER" }), "h")
    add(s, await button(o.ghost, "ghost"), "h")
  })
  if (o.loading) { const b = sh.findOne(n => n.type === "INSTANCE" && n.findOne(t => t.type === "TEXT" && t.characters === o.cta)); if (b) b.setProperties({ state: "loading" }) }
  chk("permission text", "ink-2", "paper"); chk("permission icon", o.col, o.ring || "sand", 3)
  overlay(m.screen, sh, 0, 844 - sh.height)
  return m
}
const perm = await permScreen("Default", { ic: "map-pin", col: "ink-2", title: "السماح بالوصول إلى موقعك", text: "نستخدم موقعك لنعرض لك المتاجر القريبة ونحدد عنوان التوصيل بدقة.", cta: "السماح أثناء الاستخدام", ghost: "إدخال العنوان يدويًا" })
const permDenied = await permScreen("Denied", { ic: "lock-simple", col: "ink-2", title: "إذن الموقع متوقف", text: "فعّل إذن الموقع من إعدادات الجهاز، أو أدخل عنوانك يدويًا.", cta: "فتح الإعدادات", ghost: "إدخال العنوان يدويًا" })
const permLoad = await permScreen("Loading", { ic: "crosshair", col: "ink-2", title: "نحدد موقعك", text: "لحظات ونجد موقعك الحالي…", cta: "السماح أثناء الاستخدام", ghost: "إدخال العنوان يدويًا", loading: true })
const permErr = await permScreen("Error", { ic: "warning", col: "danger", ring: "danger-bg", title: "تعذّر تحديد موقعك", text: "تأكد من تفعيل خدمة الموقع في جهازك ثم حاول مرة أخرى.", cta: "إعادة المحاولة", ghost: "إدخال العنوان يدويًا" })
await screenSection(ctx, P, "sec-acc-location-permission", "إذن الموقع · Location permission", async S => { S.main.push(perm.screen); S.states.push(permDenied.screen, permLoad.screen, permErr.screen) })

// ---- Out of coverage ---------------------------------------------------------------------------------
const cov = await mobileScreen({ path: "Location/OutOfCoverage", header: { type: "page", title: "الموقع" } })
mid(cov.body, await panel("denied", "خارج نطاق التوصيل", "لا نوصّل إلى هذا الموقع حتى الآن. اختر موقعًا آخر داخل مناطق الخدمة.", "تغيير الموقع", "map-trifold"))
add(cov.body, await txt("المناطق المتاحة حاليًا: الرياض، جدة، الدمام.", "Body/M", "ink-2", { w: 358, align: "CENTER" }), "h")
chk("coverage caption", "ink-2", "bg")
const covLoad = stateCopy(cov, "Loading"); add(covLoad.body, await txt("نتحقق من تغطية موقعك…", "Body/M", "ink-2", { w: 358 }), "h"); add(covLoad.body, await skeletonRows(2), "h")
const covErr = stateCopy(cov, "Error"); mid(covErr.body, await panel("error", "تعذّر التحقق من التغطية", "حدث خطأ أثناء التحقق من موقعك. حاول مرة أخرى.", "إعادة المحاولة"))
await screenSection(ctx, P, "sec-acc-out-of-coverage", "خارج النطاق · Out of coverage", async S => { S.main.push(cov.screen); S.states.push(covLoad.screen, covErr.screen) })

print("✅ ACC mobile (b) done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
