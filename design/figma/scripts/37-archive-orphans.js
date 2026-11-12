// Moves every top-level node that is not a Section (debris of a script run that crashed half way) from the screen pages to 🗄 Archive.
// Screens are never deleted. Re-runnable: a clean page moves nothing.
const arch = figma.root.children.find(p => p.name.indexOf("Archive") >= 0); await arch.loadAsync()
const out = []
for (const pn of ["10 Customer App", "20 Customer Web", "30 Admin", "31 Vendor", "32 Kitchen"]) {
  const pg = figma.root.children.find(p => p.name === pn); if (!pg) continue; await pg.loadAsync()
  const bad = pg.children.filter(n => n.type !== "SECTION")
  let y = arch.children.length ? Math.max(...arch.children.map(n => n.y + n.height)) + 400 : 0
  for (const n of bad) { n.x = 0; n.y = y; y += n.height + 40; arch.appendChild(n) }
  out.push(pn + " moved " + bad.length)
}
print("ARCHIVE " + out.join(" ; "))
