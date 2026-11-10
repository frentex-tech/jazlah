// ACC-DES-1 batch 2 (mobile, part a): settings (language, notifications, logout, delete account dialog), address list, edit address.
// Page 10 Customer App. Components and templates only. Arabic RTL. Prototype links are wired elsewhere.
await loadDS()
const ctx = { y: 0 }
const P = "10 Customer App"
await page(P).loadAsync()
{ const own = ["sec-acc-settings", "sec-acc-addresses", "sec-acc-address-edit"]
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

// ---- Settings --------------------------------------------------------------------------------------
function group() { return frame("group", { w: 358, pad: 16, gap: 12, fill: "paper", stroke: "line", r: "md" }) }
async function fillSettings(b, lang) {
  const g1 = group(); add(g1, await txt("اللغة", "Heading/H3"), "h")
  const r = frame("language", { dir: "HORIZONTAL", gap: 8 }); add(r, await chip("العربية", lang === "ar" ? "selected" : "default")); add(r, await chip("English", lang === "en" ? "selected" : "default")); add(g1, r)
  add(b, g1, "h")
  const g2 = group(); add(g2, await txt("الإشعارات", "Heading/H3"), "h")
  for (const [label, on] of [["إشعارات الطلبات", "yes"], ["العروض والأخبار", "no"]]) { const s = inst("switch", { checked: on, state: "default" }); await retext(s, "إضافة تغليف هدية", label); add(g2, s) }
  add(b, g2, "h")
  chk("settings group heading", "ink", "paper")
  fillSp(b)
  add(b, await button("تسجيل الخروج", "secondary"), "h")
  add(b, await button("حذف الحساب", "danger"), "h")
}
const set = await mobileScreen({ path: "Settings/Main", header: { type: "page", title: "الإعدادات" }, tab: "4" })
await fillSettings(set.body, "ar")
const setDel = stateCopy(set, "Delete confirm", true)
dim(setDel.screen)
{ const d = inst("dialog", { type: "destructive" })
  await retext(d, "حذف العنوان؟", "حذف الحساب؟")
  await retext(d, "لن تتمكن من استرجاع هذا العنوان بعد الحذف.", "سيتم حذف حسابك وعناوينك وطلباتك السابقة نهائيًا، ولا يمكن التراجع عن ذلك.")
  await retext(d, "حذف", "حذف الحساب")
  overlay(setDel.screen, d, 35, 300) }
const setLoad = stateCopy(set, "Loading"); add(setLoad.body, await skeletonRows(4), "h")
const setErr = stateCopy(set, "Error"); mid(setErr.body, await panel("error", "تعذّر تحميل الإعدادات", "تحقق من اتصالك ثم حاول مرة أخرى.", "إعادة المحاولة"))
await screenSection(ctx, P, "sec-acc-settings", "الإعدادات · Settings", async S => { S.main.push(set.screen); S.states.push(setDel.screen, setLoad.screen, setErr.screen) })

// ---- Address list ----------------------------------------------------------------------------------
const ADDR = [["المنزل", "حي الملقا، شارع أنس بن مالك، الرياض", true], ["العمل", "حي العليا، طريق الملك فهد، الرياض", false], ["بيت العائلة", "حي النرجس، الرياض", false]]
const list = await mobileScreen({ path: "Addresses/List", header: { type: "page", title: "عناويني" }, tab: "4" })
for (const a of ADDR) add(list.body, await addrCard(...a), "h")
fillSp(list.body); add(list.body, await button("إضافة عنوان جديد", "primary"), "h")
const listEmpty = stateCopy(list, "Empty"); mid(listEmpty.body, await panel("orders", "لا توجد عناوين بعد", "أضف عنوانك لنعرف المتاجر القريبة منك ونوصّل إليك.", "إضافة عنوان", "map-pin"))
const listLoad = stateCopy(list, "Loading"); add(listLoad.body, await skeletonRows(3), "h")
const listErr = stateCopy(list, "Error"); mid(listErr.body, await panel("error", "تعذّر تحميل العناوين", "حدث خطأ أثناء جلب عناوينك. حاول مرة أخرى.", "إعادة المحاولة"))
await screenSection(ctx, P, "sec-acc-addresses", "قائمة العناوين · Address list", async S => { S.main.push(list.screen); S.states.push(listEmpty.screen, listLoad.screen, listErr.screen) })

// ---- Edit address ----------------------------------------------------------------------------------
async function fillEdit(b, districtErr, btn) {
  add(b, await field("اسم العنوان", "المنزل", "filled"), "h")
  add(b, await field("المدينة", "الرياض", "filled"), "h")
  add(b, districtErr ? await field("الحي", "", "error", "الحي مطلوب") : await field("الحي", "الملقا", "filled"), "h")
  add(b, await field("الشارع وتفاصيل المبنى", "شارع أنس بن مالك، مبنى 12", "filled"), "h")
  fillSp(b)
  add(b, await button("حفظ التغييرات", "primary", btn), "h")
  add(b, await button("حذف العنوان", "ghost"), "h")
}
const edit = await mobileScreen({ path: "Addresses/Edit", header: { type: "page", title: "تعديل العنوان" }, gap: 12 })
await fillEdit(edit.body, false, "default")
const editErr = stateCopy(edit, "Error"); await fillEdit(editErr.body, true, "disabled")
const editLoad = stateCopy(edit, "Loading"); await fillEdit(editLoad.body, false, "loading")
await screenSection(ctx, P, "sec-acc-address-edit", "تعديل العنوان · Edit address", async S => { S.main.push(edit.screen); S.states.push(editErr.screen, editLoad.screen) })

print("✅ ACC mobile (a) done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
