// Side nav: the active item follows the screen (the component bakes a fixed active item). Re-runnable; run after any dashboard screen script.
// Role comes from the screen's old English name (plugin data `en`: Admin/Vendor/Kitchen prefix), the item from keywords in its path.
// Screens that match nothing keep their nav as it is and are listed.
await loadDS()
const MAP = {
  Admin: [["الإعدادات", /setting|operation|config/], ["المالية", /financ|payout|settle|invoice|commission/], ["التوصيل", /deliver|driver|shipping|logistic/], ["العملاء", /customer|user|complaint|report/], ["المنتجات", /product|catalog|listing|feed\/listings/], ["المتاجر", /vendor|store|shop|kitchens/], ["الطلبات", /order|occasion|adha|visit|cooking|quote/], ["لوحة المعلومات", /dashboard|home|overview|kpi/]],
  Vendor: [["الإعدادات", /setting/], ["الأرباح", /earn|payout|wallet/], ["منتجاتي", /product|catalog/], ["ملف المتجر", /profile|store|apply|status|onboard/], ["لوحة الطلبات", /order|dashboard|home/]],
  Kitchen: [["الإعدادات", /setting/], ["الأطباق", /dish|menu|product/], ["الجدول", /schedule|calendar|slot/], ["الطلبات الجارية", /order|queue|live|dashboard|home|board|cooking|visit/]],
}
let done = 0; const miss = {}
for (const pg of figma.root.children.filter(p => /^0[1-7] /.test(p.name))) {
  await pg.loadAsync()
  for (const s of pg.children.filter(n => n.type === "FRAME")) {
    const en = s.getSharedPluginData(NS, "en"); if (!/^(Admin|Vendor|Kitchen)\//.test(en)) continue
    const [role, ...rest] = en.split(" — ")[0].split("/"), path = rest.join("/").toLowerCase()
    const nav = s.findOne(n => n.type === "INSTANCE" && n.name === "Side nav"); if (!nav) continue
    const hit = (MAP[role] || []).find(([, re]) => re.test(path)); if (!hit) { miss[en.split(" — ")[0]] = 1; continue }
    for (const it of nav.findAll(n => n.type === "FRAME" && n.name === "nav-item")) {
      const lab = it.findOne(n => n.type === "TEXT"); if (!lab) continue
      const on = lab.characters === hit[0]
      it.fills = on ? [paint("brand-2")] : []
      lab.fills = [paint(on ? "paper" : "sand")]
      for (const v of it.findAll(n => n.type === "VECTOR" || n.type === "BOOLEAN_OPERATION")) {
        if (v.fills.length) v.fills = [paint(on ? "gold-light" : "sand")]
        if (v.strokes.length) v.strokes = [paint(on ? "gold-light" : "sand")]
      }
    }
    done++
  }
}
print("NAV active set on " + done + " screens; unmatched paths: " + (Object.keys(miss).join(", ") || "none"))
