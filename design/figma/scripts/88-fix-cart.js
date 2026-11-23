// Cart review fixes (screens already built by 80-ORD-order-journey.js; the build script is fixed too, this repairs the file):
// 1. mobile cart lines lost their row and product photo (lineRow returned the text column) -> wrap each line in a "cart line" row with the photo of its web twin
// 2. promo row, mobile and web: the field's hint sat under the input and pushed the button to the hint line; the hint becomes part of the label and the button centers on the field
await loadDS()
const pg = figma.root.children.find(p => p.name.startsWith("02")); await pg.loadAsync()
let wrapped = 0, promo = 0; const miss = []
for (const s of pg.children.filter(n => n.type === "FRAME" && n.name.startsWith("السلة"))) {
  if (s.width < 600) {
    const web = pg.children.find(n => n.type === "FRAME" && n.width > 1000 && n.name === s.name)
    const keys = web ? web.findAll(n => n.name === "photo" && n.getSharedPluginData(NS, "photo")).map(n => n.getSharedPluginData(NS, "photo")) : []
    const copies = s.findAll(n => n.name === "copy" && n.parent && n.parent.name === "card")
    for (const [i, copy] of copies.entries()) {
      const card = copy.parent, idx = card.children.indexOf(copy), W = copy.width, PW = 72
      const row = frame("cart line", { dir: "HORIZONTAL", w: W, gap: 12, cross: "CENTER" })
      card.insertChild(idx, row); row.layoutSizingHorizontal = "FILL"
      const ph = frame("photo", { w: PW, h: PW, fill: "sand", r: "md", clip: true })
      const key = keys[i] || keys[0]; if (key) { ph.setSharedPluginData(NS, "photo", key); try { await setPhoto(ph, key) } catch (e) { miss.push(key) } } else miss.push(s.name)
      add(row, ph); add(row, copy, "h")
      for (const c of copy.children) if (c.layoutSizingHorizontal !== "FILL") c.layoutSizingHorizontal = "FILL"
      wrapped++
    }
  }
  for (const r of s.findAll(n => n.name === "promo row")) {
    const inp = r.findOne(n => n.type === "INSTANCE" && n.name === "Input"), btn = r.findOne(n => n.type === "INSTANCE" && n.name === "Button")
    if (!inp || !btn || btn.parent !== r) continue
    const hint = inp.findOne(n => n.name === "hint" && n.type === "TEXT"), label = inp.findOne(n => n.name === "label" && n.type === "TEXT")
    if (hint && label) { await figma.loadFontAsync(label.fontName); label.characters = label.characters.replace(/\s*·.*$/, "") + " · " + hint.characters; hint.visible = false }
    const slot = frame("button slot", { dir: "VERTICAL", h: 52, main: "CENTER", cross: "CENTER" }); slot.primaryAxisSizingMode = "FIXED"; slot.counterAxisSizingMode = "AUTO"
    r.insertChild(r.children.indexOf(btn), slot); slot.appendChild(btn); r.counterAxisAlignItems = "MAX"; promo++
  }
}
print("CART88 wrapped " + wrapped + ", promo " + promo + (miss.length ? ", no photo: " + miss.join("|") : ""))
