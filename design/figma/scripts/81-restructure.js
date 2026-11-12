// DSN-DES-2: one-time restructure of the Figma file into what a designer would hand over.
// Pages: 01..07 (one per product area) + Design System. Each page has up to three rows of bare screens, fixed gaps:
//   1. app screens (390 wide)   2. the web twin under its app screen (same Arabic name = same column)   3. dashboard screens of that area.
// Every screen is renamed to its Arabic name only (data/frame-ar.json, or the `ar` plugin data of the new screens). The old English name is kept in
// plugin data `en`, the old Section id in `blk`, so scripts and the review can still find a screen. Sections, captions, notes, the cover, the
// flow index (90 Flows) and the Archive disappear with their pages (Figma version history keeps them). Run once, after 80-ORD-order-journey.js.
const NS = "jazlah"
const GAP_X = 120, GAP_Y = 240
const AR = await (await fetch(B + "data/frame-ar.json")).json()
const PAGES = [
  ["01 الحساب والدخول", "acc-onboarding acc-phone acc-otp acc-profile acc-settings acc-addresses acc-address-edit acc-address-map acc-location-permission acc-out-of-coverage acc-web-login acc-web-otp acc-web-profile acc-web-addresses acc-web-address-form acc-web-settings acc-admin-login-phone acc-admin-login-otp"],
  ["02 المتجر والطلب", "stf-home stf-category stf-store stf-product stf-search ord-cart-m sch-checkout-m ord-payment-m ord-placed-m opx-orders opx-order-detail opx-cancel opx-complaint opx-notifications opx-support opx-marketing stf-web-home stf-web-category stf-web-store stf-web-product stf-web-search ord-cart-w sch-checkout-w ord-payment-w ord-placed-w opx-web-order opx-web-cancel opx-web-complaint opx-web-notifications opx-web-support"],
  ["03 المواعيد والزيارة", "sch-day-reasons occ-visit-book occ-visit-detail occ-animals occ-animal-detail occ-visit-book-web occ-visit-detail-web occ-vendor-visits occ-vendor-animal"],
  ["04 المناسبات والأضاحي", "occ-wizard-type occ-wizard-details occ-wizard-date occ-quote occ-payment occ-dishes occ-cook-it occ-adha-landing occ-adha-day occ-adha-cuts occ-wizard-web occ-quote-web occ-adha-landing-web occ-adha-day-web occ-admin-occasions occ-admin-pricing occ-admin-kitchens occ-admin-adha-settings occ-admin-adha-board occ-kitchen-board"],
  ["05 الأعلاف والمحادثة", "fed-home fed-filters fed-requests fed-request-form fed-listing fed-post fed-seller fed-mine fed-chat-list fed-chat fed-chat-safety fed-web-home fed-web-listing fed-admin-listings fed-admin-reports fed-admin-report-detail"],
  ["06 البائع", "vnd-apply vnd-status vnd-store-profile vnd-products-vendor vnd-product-form vnd-product-feedback opx-vendor-board opx-vendor-actions opx-vendor-label opx-vendor-earnings opx-vendor-payouts"],
  ["07 الإدارة", "sch-ops-settings vnd-vendors vnd-vendor-review vnd-categories vnd-products-admin vnd-review-queue opx-a-overview opx-a-orders opx-a-customers opx-a-complaints opx-a-delivery opx-a-finance opx-a-staff opx-a-audit opx-a-campaign opx-a-denied"],
]
const target = {}; PAGES.forEach(([name, ids], i) => ids.split(" ").forEach(id => (target["sec-" + id] = i)))
const ROW = { "10 Customer App": "app", "20 Customer Web": "web", "30 Admin": "dash", "31 Vendor": "dash", "32 Kitchen": "dash" }
const out = [], unmapped = [], noAr = []

// 1. collect screens per target page and row, in feature order, default state first inside a screen
const bag = PAGES.map(() => ({ app: [], web: [], dash: [] }))
const order = id => PAGES.findIndex(p => p[1].split(" ").includes(id.replace("sec-", "")))
const feat = id => { const i = order(id); return i < 0 ? 999 : PAGES[i][1].split(" ").indexOf(id.replace("sec-", "")) }
let total = 0
for (const pn of Object.keys(ROW)) {
  const pg = figma.root.children.find(p => p.name === pn); if (!pg) continue; await pg.loadAsync()
  const secs = pg.children.filter(n => n.type === "SECTION").sort((a, b) => feat(a.getSharedPluginData(NS, "id")) - feat(b.getSharedPluginData(NS, "id")))
  for (const s of secs) {
    const pid = s.getSharedPluginData(NS, "id"), t = target[pid]
    if (t === undefined) { unmapped.push(pid); continue }
    const groups = new Map()
    for (const f of s.children.filter(n => n.type === "FRAME")) {
      const [path, ...st] = f.name.split(" — "); if (!groups.has(path)) groups.set(path, [])
      groups.get(path).push({ f, def: st.length === 0 || st[0] === "Default" })
    }
    for (const arr of groups.values()) {
      arr.sort((a, b) => (b.def ? 1 : 0) - (a.def ? 1 : 0))
      for (const { f } of arr) {
        const ar = f.getSharedPluginData(NS, "ar") || AR[f.id]
        if (!ar) noAr.push(f.name)
        bag[t][ROW[pn]].push({ f, ar: ar || f.name, en: f.name, pid, row: ROW[pn] }); total++
      }
    }
  }
}

// 2. create the new pages (in front), place the screens
const pages = []
for (let i = 0; i < PAGES.length; i++) { const p = figma.createPage(); p.name = PAGES[i][0]; figma.root.insertChild(i, p); await p.loadAsync(); pages.push(p) }
const uniq = list => { const seen = {}; return list.map(x => { const n = (seen[x.ar] = (seen[x.ar] || 0) + 1); x.key = n > 1 ? x.ar + "#" + n : x.ar; return x }) }
for (let i = 0; i < PAGES.length; i++) {
  const { app, web, dash } = bag[i], pg = pages[i]
  uniq(app); uniq(web)
  const keys = app.map(x => x.key); let last = -1
  for (const w of web) { const c = keys.indexOf(w.key); if (c >= 0) last = c; else { keys.splice(last + 1, 0, w.key); last++ } }
  const W = {}; for (const x of app.concat(web)) W[x.key] = Math.max(W[x.key] || 0, x.f.width)
  const X = {}; let x = 0; for (const k of keys) { X[k] = x; x += W[k] + GAP_X }
  let y = 0
  for (const row of [app, web]) {
    if (!row.length) continue
    let h = 0
    for (const s of row) { pg.appendChild(s.f); s.f.x = X[s.key]; s.f.y = y; h = Math.max(h, s.f.height) }
    y += h + GAP_Y
  }
  if (dash.length) { let dx = 0, h = 0; for (const s of dash) { pg.appendChild(s.f); s.f.x = dx; s.f.y = y; dx += s.f.width + GAP_X; h = Math.max(h, s.f.height) } }
  for (const s of app.concat(web, dash)) { s.f.name = s.ar; s.f.setSharedPluginData(NS, "en", s.en); s.f.setSharedPluginData(NS, "blk", s.pid); s.f.setSharedPluginData(NS, "row", s.row) }
  out.push(PAGES[i][0] + ": app " + app.length + ", web " + web.length + ", dash " + dash.length + ", columns " + keys.length)
}

// 3. Design System page: foundations + components + LTR rules side by side
const ds = figma.createPage(); ds.name = "Design System"; figma.root.insertChild(PAGES.length, ds); await ds.loadAsync()
let dx = 0
for (const old of ["01 Foundations", "02 Components", "99 LTR Rules"]) {
  const op = figma.root.children.find(p => p.name === old); if (!op) continue; await op.loadAsync()
  const kids = op.children.slice(); let right = 0
  for (const k of kids) { ds.appendChild(k); k.x += dx; right = Math.max(right, k.x + k.width) }
  dx = right + 600
}
await figma.setCurrentPageAsync(pages[0])

// 4. drop the old pages (cover, review, flow index, archive, the old screen pages with their sections and debris)
const keep = new Set(pages.concat([ds]))
for (const p of figma.root.children.slice()) if (!keep.has(p)) p.remove()
out.push("pages: " + figma.root.children.map(p => p.name).join(" | "))
print("RESTR-BEGIN\nscreens moved " + total + "\nunmapped sections: " + (unmapped.join(",") || "none") + "\nwithout arabic name: " + (noAr.length ? noAr.length + " e.g. " + noAr.slice(0, 4).join(" ; ") : "none") + "\n" + out.join("\n") + "\nRESTR-END")
