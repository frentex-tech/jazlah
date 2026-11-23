// The dim layers (scrim) behind dialogs and sheets and over banner photos were fully opaque (the 50% alpha never reached the bound paint),
// so the screen under a dialog was a flat dark block. Full-screen dims and banner scrims go to 55% so the screen shows through.
// The hero scrim on the login screens (<= 300 high) stays as designed.
let n = 0
for (const pg of figma.root.children.filter(p => /^0[1-7] /.test(p.name))) {
  await pg.loadAsync()
  for (const s of pg.children.filter(x => x.type === "FRAME"))
    for (const sc of s.findAll(x => x.name === "scrim")) {
      const full = sc.width >= 380 && sc.height >= 840, banner = (sc.width === 358 && sc.height === 190) || (sc.width === 1200 && sc.height === 280)
      if ((full || banner) && sc.opacity !== 0.55) { sc.opacity = 0.55; n++ }
    }
}
print("FIX86 scrims " + n)
