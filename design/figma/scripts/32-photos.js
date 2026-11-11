// QA pass: replace every image placeholder (frame holding a "ph/image" icon, store logos holding "ph/storefront") with a real photo
// from docs/design/reference/prototype/img. Idempotent (same traversal order = same photo). Run after any screen script.
await loadDS()
const PROD = ["ribeye-paper", "steaks-dark", "lamb-leg", "roast-shoulder", "strips", "tbone-pan", "steaks-garlic", "steaks-white", "chops-wood", "lamb-raw", "roast-paper", "cuts"]
const BANNERS = ["lamb-spit", "steaks-dark", "bbq", "mandi"]
const GALLERY = ["ribeye-paper", "steaks-dark", "tbone-pan"]
const CAT = { "الأغنام": "sheep", "الأبقار": "steaks-white", "الإبل": "camel", "الدواجن": "roast-paper", "المفرومات": "strips", "المشويات": "bbq", "العقائق": "lamb-raw", "الولائم": "mandi", "الأضاحي": "camel-calf", "المجمّدات": "cuts", "الأسماك": "dryage", "البهارات": "chops-wood" }
const chain = n => { const a = []; for (let p = n.parent; p && p.type !== "PAGE"; p = p.parent) a.push(p.name); return a }
let stat = { photos: 0, logos: 0 }
for (const pn of ["02 Components", "10 Customer App", "20 Customer Web", "30 Admin", "31 Vendor", "32 Kitchen"]) {
  if (!figma.root.children.find(p => p.name === pn)) continue
  const pg = figma.root.children.find(p => p.name === pn); await pg.loadAsync()
  let i = 0
  const icons = pg.findAll(n => n.name === "ph/image" || n.name === "ph/storefront")
  for (const ic of icons) {
    const c = ic.parent; if (!c || c.type === "PAGE" || !("fills" in c)) continue
    const anc = chain(ic), hint = c.getSharedPluginData(NS, "photo")
    if (ic.name === "ph/storefront") {
      if (!/logo/i.test(c.name)) continue
      c.fills = [paint("brand-deep"), await photoPaint("mark-gold", "FIT")]; ic.visible = false; stat.logos++; continue
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
  // second pass: frames that are photos/maps by name but carry no image fill (and no ph icon)
  const hasImg = n => Array.isArray(n.fills) && n.fills.some(f => f.type === "IMAGE" && f.visible !== false)
  for (const n of pg.findAll(x => x.type === "FRAME" || x.type === "RECTANGLE")) {
    if (n.visible === false || n.width < 30 || n.height < 30 || hasImg(n) || /skeleton|icon|label|row|text|caption/i.test(n.name)) continue
    if (n.type === "FRAME" && n.findOne(c => hasImg(c))) continue
    if (/(^|[\/ ])map($|[\/ ])/i.test(n.name)) { await setPhoto(n, "map"); stat.maps = (stat.maps || 0) + 1; continue }
    if (/photo|gallery|cover|banner|hero|thumb|avatar/i.test(n.name)) { await setPhoto(n, n.getSharedPluginData(NS, "photo") || (n.width >= 300 ? BANNERS[i++ % BANNERS.length] : PROD[i++ % PROD.length])); stat.photos++ }
  }
}
print("photos: " + stat.photos + ", logos: " + stat.logos + ", maps: " + (stat.maps || 0))
