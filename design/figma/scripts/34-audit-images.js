// Audit: lists every remaining image placeholder (visible ph/image or ph/storefront icon, map frames without an image fill,
// photo-like frames without an IMAGE fill). Pages 02, 10, 20, 30, 31, 32. Prints counts per page and the first paths per kind.
const PAGES = figma.root.children.filter(p => /^0[1-7] /.test(p.name)).map(p => p.name)
const hasImg = n => Array.isArray(n.fills) && n.fills.some(f => f.type === "IMAGE" && f.visible !== false)
const path = n => { const a = []; for (let p = n; p && p.type !== "PAGE"; p = p.parent) a.unshift(p.name); return a.slice(-4).join(" > ") }
const out = []
let total = 0
for (const pn of PAGES) {
  const pg = figma.root.children.find(p => p.name === pn); if (!pg) continue; await pg.loadAsync()
  const kinds = { icon: [], map: [], photoLike: [] }
  for (const n of pg.findAll(x => x.visible !== false)) {
    // ph/storefront is a Phosphor icon: only a placeholder when it fills a logo-size icon (>= 32px), smaller ones are glyphs
    if ((n.name === "ph/image" || (n.name === "ph/storefront" && n.parent && n.width >= 32)) && n.visible !== false) { kinds.icon.push(path(n)); continue }
    if (!("fills" in n) || n.type === "TEXT" || n.type === "SECTION") continue
    if (/(^|[\/ ])map($|[\/ ])/i.test(n.name) && !/pin/i.test(n.name) && !hasImg(n) && n.width > 60) kinds.map.push(path(n))
    else if (/photo|gallery|cover|banner|hero|thumb|avatar|logo/i.test(n.name) && !/skeleton|icon|label|row|text|caption/i.test(n.name) && n.width > 30 && n.height > 30 && !hasImg(n) && !(n.type === "FRAME" && n.findOne(c => hasImg(c)))) kinds.photoLike.push(path(n))
  }
  const c = kinds.icon.length + kinds.map.length + kinds.photoLike.length; total += c
  out.push(`${pn}: icon=${kinds.icon.length} map=${kinds.map.length} photoLike=${kinds.photoLike.length}`)
  for (const k of Object.keys(kinds)) { const seen = {}; for (const p of kinds[k]) { const key = p.split(" > ").slice(-2).join(" > "); seen[key] = (seen[key] || 0) + 1 }
    Object.entries(seen).slice(0, 8).forEach(([p, c]) => out.push(`   ${k} x${c}: ${p}`)) }
}
print("AUDIT total placeholders: " + total + "\n" + out.join("\n"))
