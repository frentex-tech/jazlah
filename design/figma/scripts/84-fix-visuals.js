// Visual fixes found in the screenshot review (the photo pass had painted photos where there must be none):
//  1. screens named "...coverage" had a photo as their own fill -> page background
//  2. notice banners (banner danger | info | warning | success, paused banner) had meat photos behind the message -> the notice tint
//  3. skeleton rows (loading states) had photo thumbnails -> plain placeholder blocks
// Re-runnable; 32-photos.js no longer touches these.
await loadDS()
const hasImg = n => Array.isArray(n.fills) && n.fills.some(f => f.type === "IMAGE" && f.visible !== false)
const TINT = { danger: "danger-bg", warning: "warning-bg", info: "sand", success: "sand" }
let screens = 0, banners = 0, thumbs = 0
for (const pg of figma.root.children.filter(p => /^0[1-7] /.test(p.name))) {
  await pg.loadAsync()
  for (const s of pg.children.filter(n => n.type === "FRAME")) {
    if (hasImg(s) && /coverage/i.test(s.getSharedPluginData(NS, "en"))) { s.fills = [paint("bg")]; screens++ }
    for (const n of s.findAll(x => "fills" in x && x.type !== "TEXT" && hasImg(x))) {
      const m = /^banner (danger|info|warning|success)$/.exec(n.name)
      if (m) { n.fills = [paint(TINT[m[1]])]; banners++; continue }
      if (n.name === "banner" && n.height < 120) { n.fills = [paint("warning-bg")]; banners++; continue } // plain notice banner (e.g. outside coverage); the 190 high Adha banner is a photo hero on purpose
      if (n.name === "paused banner") { n.fills = [paint("warning-bg")]; banners++; continue }
      if (n.name === "thumb") { let sk = false; for (let p = n.parent; p && p.type !== "PAGE"; p = p.parent) if (/skeleton/i.test(p.name)) sk = true; if (sk) { n.fills = [paint("sand")]; thumbs++ } }
    }
  }
}
print("FIX84 screens " + screens + ", banners " + banners + ", skeleton thumbs " + thumbs)
