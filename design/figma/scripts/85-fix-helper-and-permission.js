// Review fixes: (1) the Input component's default helper text "نص مساعد" showed under 78 fields -> hidden where no helper text was written;
// (2) "إذن الموقع" screens showed an empty skeleton under the dimmed sheet -> the real map screen sits under the scrim, and the header gets a title.
const nodes = []
for (const pg of figma.root.children.filter(p => /^0[1-7] /.test(p.name))) { await pg.loadAsync(); nodes.push(...pg.children.filter(n => n.type === "FRAME")) }
let helper = 0, perm = 0
for (const s of nodes) for (const t of s.findAll(n => n.type === "TEXT" && n.characters === "نص مساعد" && n.visible !== false)) { t.visible = false; helper++ }
const p1 = figma.root.children.find(p => p.name.startsWith("01 "))
const add = p1.children.find(n => n.type === "FRAME" && n.getSharedPluginData(NS, "en") === "App/Addresses/Add — Default")
const bbody = add && add.findOne(n => n.type === "FRAME" && n.name === "body")
for (const s of p1.children.filter(n => n.type === "FRAME" && n.getSharedPluginData(NS, "en").startsWith("App/Location/Permission"))) {
  const body = s.findOne(n => n.type === "FRAME" && n.name === "body")
  if (body && bbody) { body.children.slice().forEach(k => k.remove()); for (const k of bbody.children) body.appendChild(k.clone()); perm++ }
  const t = s.findOne(n => n.type === "TEXT" && n.characters === "عنوان الصفحة")
  if (t) { await figma.loadFontAsync(t.fontName); t.characters = "إضافة عنوان" }
}
print("FIX85 helper texts hidden " + helper + ", permission screens " + perm)
