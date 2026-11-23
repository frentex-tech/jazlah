// ACC-DES-1 batch 3 (web, part b): addresses (list, empty, loading, error; add/edit form), settings (with delete-account dialog). Page 20 Customer Web.
// Components and templates only. Arabic RTL. Prototype links are wired elsewhere.
await loadDS()
const ctx = { y: 0 }
const P = "20 Customer Web"
// ---- shared helpers (duplicated across the 13 files) ----
async function pageY(ctx, pageName, own) {
  await page(pageName).loadAsync()
  const rest = page(pageName).children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  return rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0
}
// centered 422-wide card (358 inner) inside the 1200 web body
function webCard(b, h = 520) {
  const row = frame("center", { dir: "HORIZONTAL", main: "CENTER", w: 1200, h, cross: "CENTER" })
  const c = frame("card", { w: 422, pad: 32, gap: 24, fill: "paper", stroke: "line", r: "lg" })
  row.appendChild(c); add(b, row, "h")
  return c
}
function fillSp(b) { const s = spacer(); add(b, s); s.layoutSizingVertical = "FILL" }
function overlay(screen, node, x, y) { screen.appendChild(node); node.layoutPositioning = "ABSOLUTE"; node.x = x; node.y = y }
function dim(screen) { overlay(screen, rect("scrim", screen.width, screen.height, "ink", null, { alpha: 0.5 }), 0, 0) }
ctx.y = await pageY(ctx, P, ["sec-acc-web-addresses", "sec-acc-web-address-form", "sec-acc-web-settings"])

const KD = { error: ["حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"], orders: ["لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب"] }
async function panel(kind, title, text, cta, ic) {
  const p = inst("state-panel", { kind }), d = KD[kind]
  await retext(p, d[0], title); await retext(p, d[1], text); await retext(p, d[2], cta)
  return ic ? await slot(p, "icon", async f => add(f, await icon(ic, 40, "ink-2"))) : p
}
function midRow(b, node, h = 400) { const r = frame("center", { dir: "HORIZONTAL", main: "CENTER", cross: "CENTER", w: 1200, h }); r.appendChild(node); add(b, r, "h") }
async function addrCard(name, line, def, w = 588) {
  const c = frame("address card", { dir: "HORIZONTAL", w, pad: 16, gap: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  const ring = frame("pin", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" }); add(ring, await icon("map-pin", 24, "ink")); add(c, ring)
  const t = frame("text", { gap: 4 })
  const head = frame("head", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" }); add(head, await txt(name, "Heading/H3"))
  if (def) { const bd = inst("badge", { type: "success", size: "S" }); await retext(bd, "تم التسليم", "افتراضي"); add(head, bd) }
  add(t, head); add(t, await txt(line, "Body/M", "ink-2", { w: 420 }))
  add(c, t, "h")
  const e = frame("edit", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER" }); add(e, await icon("pencil-simple", 20, "ink-2")); add(c, e)
  chk("address card title", "ink", "paper"); chk("address card line", "ink-2", "paper")
  return c
}
async function pageHead(b, title, cta) {
  const h = frame("page head", { dir: "HORIZONTAL", w: 1200, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(h, await txt(title, "Heading/H1")); if (cta) add(h, await button(cta, "primary", "default", "S"))
  add(b, h, "h")
}

// ---- Address list ----------------------------------------------------------------------------------------
const ADDR = [["المنزل", "حي الملقا، شارع أنس بن مالك، الرياض", true], ["العمل", "حي العليا، طريق الملك فهد، الرياض", false], ["بيت العائلة", "حي النرجس، الرياض", false], ["المزرعة", "حي الصحافة، الرياض", false]]
async function listScreen(state, build) {
  const w = await webScreen({ path: "Addresses/List", state, active: 3 })
  await pageHead(w.body, "عناويني", state === "Default" || state === "Loading" ? "إضافة عنوان" : null)
  await build(w.body)
  return w.screen
}
const list = await listScreen("Default", async b => {
  for (let i = 0; i < ADDR.length; i += 2) { const r = frame("row", { dir: "HORIZONTAL", w: 1200, gap: 24 }); for (const a of ADDR.slice(i, i + 2)) add(r, await addrCard(...a)); add(b, r, "h") }
})
const listEmpty = await listScreen("Empty", async b => midRow(b, await panel("orders", "لا توجد عناوين بعد", "أضف عنوانك لنعرف المتاجر القريبة منك ونوصّل إليك.", "إضافة عنوان", "map-pin")))
const listLoad = await listScreen("Loading", async b => { for (let i = 0; i < 2; i++) { const r = frame("row", { dir: "HORIZONTAL", w: 1200, gap: 24 }); for (let j = 0; j < 3; j++) add(r, inst("skeleton-row")); add(b, r, "h") } })
const listErr = await listScreen("Error", async b => midRow(b, await panel("error", "تعذّر تحميل العناوين", "حدث خطأ أثناء جلب عناوينك. حاول مرة أخرى.", "إعادة المحاولة")))
await screenSection(ctx, P, "sec-acc-web-addresses", "العناوين · Web addresses", async S => { S.main.push(list); S.states.push(listEmpty, listLoad, listErr) })

// ---- Add / edit address form (map beside form) -------------------------------------------------------------
async function formScreen(state, districtErr, btn) {
  const w = await webScreen({ path: "Addresses/Form", state, active: 3 })
  await pageHead(w.body, "إضافة عنوان جديد")
  const row = frame("form row", { dir: "HORIZONTAL", w: 1200, gap: 24 })
  const f = frame("form", { w: 390, pad: 16, gap: 16, fill: "paper", stroke: "line", r: "lg" })
  add(f, await field("اسم العنوان", "المنزل", "filled"), "h")
  add(f, await field("المدينة", "الرياض", "filled"), "h")
  add(f, districtErr ? await field("الحي", "اكتب هنا", "error", "الحي مطلوب") : await field("الحي", "الملقا", "filled"), "h")
  add(f, await field("الشارع وتفاصيل المبنى", "شارع أنس بن مالك، مبنى 12", "filled"), "h")
  add(f, await button("حفظ العنوان", "primary", btn), "h")
  add(row, f)
  const map = frame("map placeholder", { w: 786, h: 560, main: "CENTER", cross: "CENTER", fill: "sand", r: "lg", clip: true })
  add(map, await icon("map-trifold", 56, "ink-2"))
  overlay(map, inst("map-pin", { type: "address", state: "default" }), 380, 240)
  const sb = inst("search-bar", { state: "filled" }); await retext(sb, "ريب آي", "الملقا، الرياض"); overlay(map, sb, 414, 16)
  add(row, map)
  add(w.body, row, "h")
  chk("web form card", "ink", "paper")
  return w.screen
}
const form = await formScreen("Default", false, "default")
const formErr = await formScreen("Error", true, "disabled")
const formLoad = await formScreen("Loading", false, "loading")
await screenSection(ctx, P, "sec-acc-web-address-form", "إضافة وتعديل العنوان · Web address form", async S => { S.main.push(form); S.states.push(formErr, formLoad) })

// ---- Settings --------------------------------------------------------------------------------------------------
function group() { return frame("group", { w: 358, pad: 16, gap: 12, fill: "bg", stroke: "line", r: "md" }) }
async function settingsScreen(state, build) {
  const w = await webScreen({ path: "Settings/Main", state, active: 3 })
  await pageHead(w.body, "الإعدادات")
  await build(w.body)
  return w.screen
}
async function settingsCard(b, h = 640) {
  const c = webCard(b, h)
  const g1 = group(); add(g1, await txt("اللغة", "Heading/H3"), "h")
  const r = frame("language", { dir: "HORIZONTAL", gap: 8 }); add(r, await chip("العربية", "selected")); add(r, await chip("English", "default")); add(g1, r); add(c, g1, "h")
  const g2 = group(); add(g2, await txt("الإشعارات", "Heading/H3"), "h")
  for (const [label, on] of [["إشعارات الطلبات", "yes"], ["العروض والأخبار", "no"]]) { const s = inst("switch", { checked: on, state: "default" }); await retext(s, "إضافة تغليف هدية", label); add(g2, s) }
  add(c, g2, "h")
  add(c, await button("تسجيل الخروج", "secondary"), "h")
  add(c, await button("حذف الحساب", "danger"), "h")
  chk("settings group heading", "ink", "bg")
}
const st = await settingsScreen("Default", b => settingsCard(b))
const stDel = await settingsScreen("Delete confirm", b => settingsCard(b))
dim(stDel)
{ const d = inst("dialog", { type: "destructive" })
  await retext(d, "حذف العنوان؟", "حذف الحساب؟")
  await retext(d, "لن تتمكن من استرجاع هذا العنوان بعد الحذف.", "سيتم حذف حسابك وعناوينك وطلباتك السابقة نهائيًا، ولا يمكن التراجع عن ذلك.")
  await retext(d, "حذف", "حذف الحساب")
  overlay(stDel, d, 560, 340) }
const stLoad = await settingsScreen("Loading", async b => { const c = webCard(b, 640); add(c, await skeletonRows(4), "h") })
const stErr = await settingsScreen("Error", async b => midRow(b, await panel("error", "تعذّر تحميل الإعدادات", "تحقق من اتصالك ثم حاول مرة أخرى.", "إعادة المحاولة"), 640))
await screenSection(ctx, P, "sec-acc-web-settings", "الإعدادات · Web settings", async S => { S.main.push(st); S.states.push(stDel, stLoad, stErr) })

print("✅ ACC web (b) done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
