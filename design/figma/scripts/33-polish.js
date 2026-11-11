// QA polish over pages 02, 10, 20, 30: cart counter badge, Readex section titles, sections fit to their screens and laid out in a
// grid (one flow per row), prototype start on Home. Idempotent.
await loadDS()
let n = 0
for (const pn of ["02 Components", "10 Customer App", "20 Customer Web", "30 Admin"]) {
  const pg = page(pn); await pg.loadAsync()
  for (const c of pg.findAll(x => x.type === "FRAME" && x.name === "counter")) {
    c.resize(20, 20); c.clipsContent = false; c.cornerRadius = 10; c.strokes = [paint("paper")]; c.strokeWeight = 2; c.strokeAlign = "OUTSIDE"
    c.x = -6; c.y = -6; n++
    if (c.parent) c.parent.clipsContent = false
  }
}
print("counters fixed: " + n)
const ROWS = {
  "10 Customer App": [["sec-acc-onboarding", "sec-acc-phone", "sec-acc-otp", "sec-acc-profile"], ["sec-acc-settings", "sec-acc-addresses", "sec-acc-address-edit", "sec-acc-address-map", "sec-acc-location-permission", "sec-acc-out-of-coverage"],
    ["sec-stf-home", "sec-stf-category", "sec-stf-store"], ["sec-stf-product", "sec-stf-search"], ["sec-sch-checkout-m", "sec-sch-day-reasons"]],
  "20 Customer Web": [["sec-acc-web-login", "sec-acc-web-otp", "sec-acc-web-profile"], ["sec-acc-web-addresses", "sec-acc-web-address-form", "sec-acc-web-settings"],
    ["sec-stf-web-home", "sec-stf-web-category", "sec-stf-web-store"], ["sec-stf-web-product", "sec-stf-web-search"], ["sec-sch-checkout-w"]],
  "30 Admin": [["sec-acc-admin-login-phone", "sec-acc-admin-login-otp"], ["sec-sch-ops-settings"]],
}
for (const pn of Object.keys(ROWS)) {
  const pg = page(pn), secs = pg.children.filter(x => x.type === "SECTION")
  for (const s of secs) {
    const t = s.children.find(x => x.type === "TEXT"); if (t && t.textStyleId === DS.S["Display/L"].id) await t.setTextStyleIdAsync(DS.S["Heading/H1"].id)
    let w = 0, h = 0; for (const c of s.children) { w = Math.max(w, c.x + c.width); h = Math.max(h, c.y + c.height) }
    if (w && h) s.resizeWithoutConstraints(w + 40, h + 40)
  }
  const byId = Object.fromEntries(secs.map(s => [s.getSharedPluginData(NS, "id"), s]))
  const used = new Set(), rows = ROWS[pn].map(r => r.filter(id => byId[id]))
  rows.flat().forEach(id => used.add(id))
  const rest = Object.keys(byId).filter(id => !used.has(id)); if (rest.length) rows.push(rest)
  let y = 0
  for (const r of rows) { let x = 0, mh = 0; for (const id of r) { const s = byId[id]; s.x = x; s.y = y; x += s.width + 200; mh = Math.max(mh, s.height) } if (mh) y += mh + 400 }
  print(pn + ": " + rows.map(r => r.length).join("+") + " sections in " + rows.length + " rows")
}
// prototype: Home first
const p10 = page("10 Customer App")
const home = p10.findOne(x => x.type === "FRAME" && x.name === "App/Home/Home — Default"), onb = p10.findOne(x => x.type === "FRAME" && x.name === "App/Onboarding/Slide 1 — Default")
const fsp = []; if (home) fsp.push({ nodeId: home.id, name: "Regular order: home → product → checkout" }); if (onb) fsp.push({ nodeId: onb.id, name: "ACC: first launch to profile" })
p10.flowStartingPoints = fsp
print("flow starts: " + p10.flowStartingPoints.map(f => f.name).join(" | "))
