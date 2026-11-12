// Store/vendor cover strips: the original cover photo carries a pale fade on one side. Every image-filled `cover` takes a product photo of its own screen instead
// (a wide crop of meat fills the strip edge to edge). Screens without any product photo are listed and left as they are.
let n = 0, fallback; const skipped = []
for (const p of figma.root.children.filter(p => /^0[1-7] /.test(p.name))) {
  await p.loadAsync()
  for (const s of p.children.filter(x => x.type === "FRAME")) {
    const cv = s.findAll(x => x.name === "cover" && Array.isArray(x.fills) && x.fills.some(f => f.type === "IMAGE")); if (!cv.length) continue
    const ph = s.findAll(x => x.name !== "cover" && !/logo|mark|avatar|emblem/i.test(x.name) && Array.isArray(x.fills) && x.fills.some(f => f.type === "IMAGE" && f.visible !== false) && x.width >= 60 && x.width <= 260 && x.height >= 60)
    const src = ph[2] || ph[0]; if (!src) { skipped.push(s.name); continue }
    const im = src.fills.find(f => f.type === "IMAGE")
    if (fallback === undefined && s.name === "صفحة المتجر") fallback = im
    for (const c of cv) { c.fills = [{ type: "IMAGE", imageHash: im.imageHash, scaleMode: "FILL" }]; n++ }
  }
}
// screens with no product photo of their own (empty / error states) take the cover of the default store screen
if (fallback) for (const p of figma.root.children.filter(p => /^0[1-7] /.test(p.name))) for (const s of p.children.filter(x => x.type === "FRAME" && x.name.startsWith("صفحة المتجر")))
  for (const c of s.findAll(x => x.name === "cover" && Array.isArray(x.fills) && x.fills.some(f => f.type === "IMAGE"))) c.fills = [{ type: "IMAGE", imageHash: fallback.imageHash, scaleMode: "FILL" }]
print("CVFIX " + n + " " + skipped.join("|"))
