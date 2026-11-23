// DSN-DES-2 (#204) detail fixes, 2026-11-13. Run after 90-DSN-DES-2-client-ready.js (needs J).
// Every pass is safe to re-run. Rewritten from the live session in short form; the one-off passes that are
// not here (web header/footer swap, account side menu, split sign-in, image remapping, the two new app
// screens) are described in docs/design/signoff.md and were applied directly in the file.
const ds = figma.root.children[7]
const S = n => ds.findOne(x => x.type === 'COMPONENT_SET' && x.name === n)

// 1. Badges: light background, dark text of the same hue (AA)
const TONE = { neutral: ['sand', 'ink-2'], info: ['#E3EEF2', 'info'], warning: ['warning-bg', 'warning'], success: ['#E4F0E7', '#2C5E3A'], danger: ['danger-bg', 'danger'], brand: ['#F6EBD6', 'gold-text'] }
for (const c of S('Badge').children) {
  const t = c.name.match(/type=(\w+)/)[1]
  c.fills = [J.p(TONE[t][0])]
  const l = c.findOne(x => x.name === 'label'); if (l) l.fills = [J.p(TONE[t][1])]
}

// 2. Filters bar: each select carries its real name
const NAMES = ['طريقة الدفع', 'المتجر', 'الحالة']
for (const v of S('Filters bar').children) {
  let i = 0
  for (const s of v.findAll(x => x.type === 'INSTANCE' && x.name === 'Select')) {
    const t = s.findOne(x => x.type === 'TEXT' && x.name === 'value')
    if (t && t.characters === 'الحالة') { await figma.loadFontAsync(t.fontName); t.characters = NAMES[i % 3] }
    i++
  }
}

// 3. Top bar avatar: initials, not a photo. Skeleton thumbs: plain sand
const av = ds.findOne(x => x.type === 'COMPONENT' && x.name === 'Top bar').findOne(x => x.name === 'avatar')
av.fills = [J.p('brand')]; const at = av.findOne(x => x.type === 'TEXT'); if (at) at.fills = [J.p('gold-light')]

for (const f of J.all()) {
  const mobile = f.width === 390, dash = J.g(f, 'row') === 'dash'

  // 4. Scrims: the real screen shows through at 55%
  for (const c of f.children) if (/^(dim|scrim)$/i.test(c.name)) { c.fills = [{ type: 'SOLID', color: { r: .1, g: .04, b: .05 }, opacity: .55 }]; c.opacity = 1 }

  // 5. Cart icon only on shopping screens (storefront blocks)
  if (mobile && !/sec-stf-/.test(J.g(f, 'blk'))) f.findAll(x => x.type === 'INSTANCE' && x.name === 'App header').forEach(h => { const a = h.findOne(x => x.name === 'actions'); if (a) a.opacity = 0 })

  // 6. Address map: no icon in the middle, search without the filter button
  for (const pin of f.findAll(x => x.type === 'INSTANCE' && x.name === 'Map pin')) {
    pin.parent.children.filter(c => c.name === 'ph/map-trifold').forEach(c => c.remove())
    for (const s of pin.parent.children.filter(c => c.type === 'INSTANCE' && c.name === 'Search bar')) {
      const fl = s.findOne(x => x.name === 'filter'); if (fl) fl.visible = false
      const q = s.findOne(x => x.name === 'query')
      if (q && q.characters.includes('لحوم')) { await figma.loadFontAsync(q.fontName); q.characters = 'ابحث عن حي أو شارع' }
    }
  }

  // 7. One export button per dashboard screen (keep the one outside the filters bar)
  if (dash) {
    const ex = f.findAll(x => x.type === 'TEXT' && /^تصدير/.test(x.characters) && x.visible)
    if (ex.length > 1) {
      const up = (t, test) => { let p = t.parent; while (p && p !== f) { if (test(p)) return p; p = p.parent } return null }
      const keep = ex.find(t => !up(t, p => p.name === 'Filters bar')) || ex[0]
      for (const t of ex) if (t !== keep) (up(t, p => p.type === 'INSTANCE' && p.name === 'Button') || t.parent).visible = false
    }
  }

  // 8. Settings: delete account is a small red link
  if (/الإعدادات/.test(f.name)) for (const b of f.findAll(x => x.type === 'INSTANCE' && x.name === 'Button')) {
    const t = b.findOne(x => x.type === 'TEXT')
    if (t && t.characters === 'حذف الحساب') { b.setProperties({ variant: 'ghost', size: 'S' }); const t2 = b.findOne(x => x.type === 'TEXT'); t2.fills = [J.p('danger')]; t2.fontSize = 13 }
  }

  // 9. Payment review: one method selected by default
  if (/الدفع والمراجعة/.test(f.name)) {
    const rs = f.findAll(x => x.type === 'INSTANCE' && x.name === 'Radio')
    if (rs.length && !rs.some(r => r.mainComponent.name.includes('checked=yes'))) rs.sort((a, b) => a.absoluteTransform[1][2] - b.absoluteTransform[1][2])[0].setProperties({ checked: 'yes' })
  }
}
