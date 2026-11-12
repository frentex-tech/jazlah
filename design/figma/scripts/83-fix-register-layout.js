// Vendor animal registration: the 1132 wide form section sat inside a 720 column and overflowed the screen. One column instead:
// form section on top, photos box under it, both 1132 wide; the screen grows to fit. Works on the finished pages (screens found by plugin data `en`).
let n = 0
for (const pg of figma.root.children.filter(p => /^0[1-7] /.test(p.name))) {
  await pg.loadAsync()
  for (const f of pg.children.filter(x => x.type === "FRAME" && x.getSharedPluginData(NS, "en").startsWith("Vendor/Animals/Register"))) {
    const cols = f.findOne(x => x.type === "FRAME" && x.name === "columns"); if (!cols) continue
    cols.layoutMode = "VERTICAL"; cols.itemSpacing = 16
    for (const c of cols.children) { c.layoutSizingHorizontal = "FIXED"; c.resize(1132, c.height); for (const k of c.children) if ("layoutSizingHorizontal" in k) k.layoutSizingHorizontal = "FILL" }
    const need = cols.absoluteBoundingBox.y + cols.height - f.absoluteBoundingBox.y + 32
    if (need > f.height) f.resize(f.width, Math.ceil(need))
    n++
  }
}
print("FIX83 register frames " + n)
