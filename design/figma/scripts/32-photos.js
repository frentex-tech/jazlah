// QA pass: replace every image placeholder (frame holding a "ph/image" icon, store logos holding "ph/storefront") with a real photo
// from docs/design/reference/prototype/img. Idempotent (same traversal order = same photo). Run after any screen script.
await loadDS()
const PROD = ["ribeye-paper", "steaks-dark", "lamb-leg", "roast-shoulder", "strips", "tbone-pan", "steaks-garlic", "steaks-white", "chops-wood", "lamb-raw", "roast-paper", "cuts"]
const BANNERS = ["lamb-spit", "steaks-dark", "bbq", "mandi"]
const GALLERY = ["ribeye-paper", "steaks-dark", "tbone-pan"]
const CAT = { "الأغنام": "sheep", "الأبقار": "steaks-white", "الإبل": "camel", "الدواجن": "roast-paper", "المفرومات": "strips", "المشويات": "bbq", "العقائق": "lamb-raw", "الولائم": "mandi", "الأضاحي": "camel-calf", "المجمّدات": "cuts", "الأسماك": "dryage", "البهارات": "chops-wood" }
const chain = n => { const a = []; for (let p = n.parent; p && p.type !== "PAGE"; p = p.parent) a.push(p.name); return a }
let stat = { photos: 0, logos: 0 }
for (const pn of ["02 Components", "10 Customer App", "20 Customer Web", "30 Admin"]) {
  const pg = page(pn); await pg.loadAsync()
  let i = 0
  const icons = pg.findAll(n => n.name === "ph/image" || n.name === "ph/storefront")
  for (const ic of icons) {
    const c = ic.parent; if (!c || c.type === "PAGE" || !("fills" in c)) continue
    const anc = chain(ic), hint = c.getSharedPluginData(NS, "photo")
    if (ic.name === "ph/storefront") {
      if (!/logo/i.test(c.name)) continue
      c.fills = [await photoPaint("mark-gold", "FIT"), paint("brand-deep")]; ic.visible = false; stat.logos++; continue
    }
    let key = hint
    if (!key && anc.some(a => /category.?tile/i.test(a))) { const t = c.parent.findOne(x => x.type === "TEXT"); key = (t && CAT[t.characters]) || "sheep" }
    if (!key && anc.some(a => /product.?card/i.test(a))) key = PROD[i++ % PROD.length]
    if (!key && (anc.some(a => /banner/i.test(a)) || /banner/i.test(c.name))) key = BANNERS[i++ % BANNERS.length]
    if (!key && /gallery/i.test(c.name)) key = GALLERY[i++ % GALLERY.length]
    if (!key && /cover/i.test(c.name)) key = "butchers"
    if (!key) key = c.width >= 300 ? BANNERS[i++ % BANNERS.length] : PROD[i++ % PROD.length]
    await setPhoto(c, key); stat.photos++
  }
}
print("photos: " + stat.photos + ", logos: " + stat.logos)
