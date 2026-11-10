// DSN-DES-1, batch 3a: composite mobile components (header, search, badge, card, product card, store card, category,
// section header, empty/error states, map pin, status timeline) on page 02 Components. Needs batches 1 and 2 (it uses their button).
// Phosphor icons: regular, fill when active. Directional icons point the RTL way (back = caret-right).
await loadDS()
const ctx = { y: 0 }
const P = "02 Components"
const lbl = async (body, ar, en) => add(body, await txt(`${ar} · ${en}`, "Heading/H3"), "h")
// place this batch's sections below the existing ones on the page
{ const pg = page(P); await figma.setCurrentPageAsync(pg); const own = ["sec-header", "sec-badge", "sec-cards", "sec-states", "sec-map-timeline"]
  const rest = pg.children.filter(n => !own.includes(n.getSharedPluginData(NS, "id")))
  ctx.y = rest.length ? Math.max(...rest.map(n => n.y + n.height)) + 200 : 0 }

// ---- Header, search, section header ----------------------------------------------
await sectionOn(ctx, P, "sec-header", "الرأس والبحث · Header & search", async body => {
  await lbl(body, "رأس التطبيق (السلة أيقونة عليها عدّاد)", "App header")
  await defineSet(body, "app-header", "App header", { type: ["home", "page"], cart: ["empty", "filled"] }, async ({ type, cart }) => {
    const c = frame("app-header", { comp: true, dir: "HORIZONTAL", w: 390, px: 16, py: 12, gap: 12, cross: "CENTER", fill: "bg", main: "SPACE_BETWEEN" })
    if (type === "home") {
      const side = frame("title", { gap: 2 })
      add(side, await txt("جزلة", "Display/L", "brand", { name: "wordmark" }))
      const loc = frame("location", { dir: "HORIZONTAL", gap: 4, cross: "CENTER" })
      add(loc, await icon("map-pin", 16, "ember", "fill")); add(loc, await txt("التوصيل إلى الملقا، الرياض", "Label/M", "ink-2")); add(loc, await icon("caret-down", 14, "ink-2"))
      add(side, loc)
      add(c, side)
    } else {
      const back = frame("back", { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "paper", stroke: "line", r: "pill" })
      add(back, await icon("caret-right", 20, "ink")) // RTL: back points right
      add(c, back)
      add(c, await txt("عنوان الصفحة", "Heading/H2", "ink", { align: "CENTER" }))
    }
    const actions = frame("actions", { dir: "HORIZONTAL", gap: 8 })
    const mk = async (name, filled) => {
      const b = frame(name, { dir: "HORIZONTAL", w: 44, h: 44, main: "CENTER", cross: "CENTER", fill: "paper", stroke: "line", r: "pill" })
      add(b, await icon(name, 22, "ink"))
      if (filled) { // counter: a small badge in the corner, placed as an absolute child
        const dot = frame("counter", { dir: "HORIZONTAL", w: 18, h: 18, main: "CENTER", cross: "CENTER", fill: "ember", r: "pill" })
        add(dot, await txt("3", "Caption", "paper", { align: "CENTER", name: "count" }))
        b.appendChild(dot); dot.layoutPositioning = "ABSOLUTE"; dot.x = 0; dot.y = -2
      }
      return b
    }
    add(actions, await mk("shopping-bag", cart === "filled"))
    if (type === "home") add(actions, await mk("bell", false))
    add(c, actions)
    chk("header title", "ink", "bg"); chk("header location", "ink-2", "bg"); chk("cart counter", "paper", "ember")
    return c
  })

  await lbl(body, "شريط البحث", "Search bar")
  await defineSet(body, "search-bar", "Search bar", { state: ["default", "focused", "filled"] }, async ({ state }) => {
    const c = frame("search-bar", { comp: true, dir: "HORIZONTAL", w: 358, h: 52, px: 16, gap: 12, cross: "CENTER", fill: "paper", stroke: state === "focused" ? "ember" : "line", sw: state === "focused" ? 2 : 1, r: "md" })
    add(c, await icon("magnifying-glass", 22, "ink-2"))
    add(c, await txt(state === "filled" ? "ريب آي" : "ابحث عن لحوم أو متاجر", "Body/L", state === "filled" ? "ink" : "muted", { name: "query" }), "h")
    if (state === "filled") add(c, await icon("x", 18, "ink-2"))
    const f = frame("filter", { dir: "HORIZONTAL", w: 36, h: 36, main: "CENTER", cross: "CENTER", fill: "brand", r: "sm" })
    add(f, await icon("sliders-horizontal", 20, "paper")); add(c, f)
    chk("search placeholder", "muted", "paper"); chk("search text", "ink", "paper")
    return c
  })

  await lbl(body, "عنوان قسم", "Section header")
  const sh = frame("section-header", { comp: true, dir: "HORIZONTAL", w: 358, main: "SPACE_BETWEEN", cross: "CENTER" })
  add(sh, await txt("الأكثر مبيعًا", "Heading/H2", "ink", { name: "title" }))
  const all = frame("link", { dir: "HORIZONTAL", gap: 4, cross: "CENTER" })
  add(all, await txt("الكل", "Label/M", "ember")); add(all, await icon("caret-left", 16, "ember")) // forward in RTL
  add(sh, all)
  defineOne(body, "section-header", "Section header", sh)
  chk("section link", "ember", "bg")
})

// ---- Badges -----------------------------------------------------------------------
await sectionOn(ctx, P, "sec-badge", "الشارات · Badges", async body => {
  await lbl(body, "شارة حالة", "Badge (status colors from tokens; dot + ink text)")
  const T = { neutral: ["muted", "جديد"], info: ["info", "قيد المراجعة"], warning: ["warning", "قيد التجهيز"], success: ["success", "تم التسليم"], danger: ["danger", "ملغي"], brand: ["gold", "ذُبح اليوم"] }
  await defineSet(body, "badge", "Badge", { type: Object.keys(T), size: ["M", "S"] }, async ({ type, size }) => {
    const [col, text] = T[type], S = size === "S"
    const c = frame("badge", { comp: true, dir: "HORIZONTAL", h: S ? 22 : 28, px: S ? 8 : 12, gap: 6, cross: "CENTER", main: "CENTER", fill: col, alpha: 0.16, r: "pill" })
    add(c, circle("dot", 8, col))
    add(c, await txt(text, S ? "Caption" : "Label/M", "ink", { name: "label" }))
    chk(`badge ${type} text`, "ink", [col, 0.16, "paper"])
    return c
  })
})

// ---- Cards -------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-cards", "البطاقات · Cards", async body => {
  await lbl(body, "بطاقة عامة", "Card (content slot)")
  await defineSet(body, "card", "Card", { state: ["default", "selected"] }, async ({ state }) => {
    const sel = state === "selected"
    const c = frame("card", { comp: true, w: 342, pad: 16, gap: 8, fill: "paper", stroke: sel ? "ember" : "line", sw: sel ? 2 : 1, r: "md" })
    add(c, await txt("عنوان البطاقة", "Heading/H3", "ink", { w: 310 }), "h")
    add(c, await txt("نص توضيحي قصير يصف محتوى البطاقة.", "Body/M", "ink-2", { w: 310 }), "h")
    await shade(c)
    chk("card text", "ink-2", "paper")
    return c
  })

  await lbl(body, "بطاقة منتج (اسم المتجر ظاهر)", "Product card")
  await defineSet(body, "product-card", "Product card", { state: ["default", "unavailable"] }, async ({ state }) => {
    const off = state === "unavailable"
    const c = frame("product-card", { comp: true, w: 165, fill: "paper", stroke: "line", r: "md", clip: true })
    const img = frame("image", { dir: "HORIZONTAL", w: 165, h: 120, main: "CENTER", cross: "CENTER", fill: "sand" })
    add(img, await icon("image", 32, "ink-2")); add(c, img, "h")
    const info = frame("info", { pad: 12, gap: 6 })
    const vendor = frame("vendor", { dir: "HORIZONTAL", gap: 4, cross: "CENTER" })
    add(vendor, await icon("storefront", 14, "ink-2")); add(vendor, await txt("مجازر الفلاح", "Caption", "ink-2", { name: "vendor" }))
    add(info, vendor)
    add(info, await txt("ريب آي بقري طازج", "Label/M", off ? "ink-2" : "ink", { name: "title", w: 141 }), "h")
    add(info, await txt("500 جم · تقطيع شرائح", "Caption", "ink-2", { w: 141 }), "h")
    add(info, off ? inst("badge", { type: "warning", size: "S" }) : inst("badge", { type: "brand", size: "S" }))
    const buy = frame("buy", { dir: "HORIZONTAL", main: "SPACE_BETWEEN", cross: "CENTER" })
    const price = frame("price", { dir: "HORIZONTAL", gap: 4, cross: "MAX" })
    add(price, await txt("89.00", "Heading/H3", off ? "ink-2" : "ink", { name: "price" })); add(price, await txt("ر.س", "Caption", "ink-2"))
    add(buy, price)
    const plus = frame("add", { dir: "HORIZONTAL", w: 36, h: 36, main: "CENTER", cross: "CENTER", fill: off ? "sand" : "ember", r: "pill" })
    add(plus, await icon("plus", 20, off ? "muted-soft" : "paper")); add(buy, plus)
    add(info, buy, "h"); add(c, info, "h")
    await shade(c)
    chk("product title", off ? "ink-2" : "ink", "paper"); chk("product meta", "ink-2", "paper"); chk("product add", "paper", "ember")
    return c
  })

  await lbl(body, "بطاقة متجر شريك", "Store card")
  const st = frame("store-card", { comp: true, w: 104, pad: 12, gap: 8, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  const logo = frame("logo", { dir: "HORIZONTAL", w: 64, h: 64, main: "CENTER", cross: "CENTER", fill: "sand", r: "pill" })
  add(logo, await icon("storefront", 28, "brand")); add(st, logo)
  add(st, await txt("مجازر الفلاح", "Label/M", "ink", { name: "name", align: "CENTER", w: 80 }))
  const rate = frame("rating", { dir: "HORIZONTAL", gap: 4, cross: "CENTER" })
  add(rate, await icon("star", 14, "gold-text", "fill")); add(rate, await txt("4.8", "Caption", "ink-2")); add(st, rate)
  defineOne(body, "store-card", "Store card", st)
  chk("store name", "ink", "paper"); chk("store rating star", "gold-text", "paper", 3)

  await lbl(body, "دائرة قسم", "Category tile")
  const cat = frame("category-tile", { comp: true, w: 84, gap: 8, cross: "CENTER" })
  const ci = frame("image", { dir: "HORIZONTAL", w: 72, h: 72, main: "CENTER", cross: "CENTER", fill: "sand", stroke: "gold-deco", r: "pill" })
  add(ci, await icon("image", 28, "ink-2")); add(cat, ci)
  add(cat, await txt("الأغنام", "Label/M", "ink", { name: "name", align: "CENTER", w: 84 }))
  defineOne(body, "category-tile", "Category tile", cat)
  chk("category name", "ink", "bg")
})

// ---- Empty / error states --------------------------------------------------------------
await sectionOn(ctx, P, "sec-states", "الحالات الفارغة والأخطاء · Empty & error states", async body => {
  await lbl(body, "حالة فارغة / خطأ", "State panel (empty, no results, error, offline, permission denied)")
  const K = {
    cart: ["shopping-bag", "ink-2", "سلتك فارغة", "أضف منتجات من المتاجر وسنجهّزها لك طازجة.", "تصفّح المنتجات"],
    orders: ["receipt", "ink-2", "لا توجد طلبات بعد", "طلباتك السابقة والحالية ستظهر هنا.", "ابدأ أول طلب"],
    search: ["magnifying-glass", "ink-2", "لا توجد نتائج", "جرّب كلمات أخرى أو غيّر عوامل التصفية.", "مسح التصفية"],
    error: ["warning-circle", "danger", "حدث خطأ غير متوقع", "تعذّر تحميل البيانات. حاول مرة أخرى.", "إعادة المحاولة"],
    offline: ["wifi-slash", "warning", "لا يوجد اتصال بالإنترنت", "تحقق من اتصالك ثم أعد المحاولة.", "إعادة المحاولة"],
    denied: ["lock-simple", "ink-2", "ليست لديك صلاحية", "تواصل مع مدير الحساب للحصول على الوصول.", "رجوع"],
  }
  await defineSet(body, "state-panel", "State panel", { kind: Object.keys(K) }, async ({ kind }) => {
    const [ic, col, title, text, cta] = K[kind]
    const c = frame("state-panel", { comp: true, w: 342, pad: 24, gap: 12, cross: "CENTER", main: "CENTER" })
    const ring = frame("icon", { dir: "HORIZONTAL", w: 88, h: 88, main: "CENTER", cross: "CENTER", fill: kind === "error" ? "danger-bg" : kind === "offline" ? "warning-bg" : "sand", r: "pill" })
    add(ring, await icon(ic, 40, col)); add(c, ring)
    add(c, await txt(title, "Heading/H2", "ink", { name: "title", align: "CENTER", w: 294 }), "h")
    add(c, await txt(text, "Body/M", "ink-2", { name: "body", align: "CENTER", w: 294 }), "h")
    const b = inst("button", { variant: kind === "error" || kind === "offline" ? "primary" : "secondary", state: "default", size: "L" }); setProp(b, "label", cta)
    add(c, b)
    chk(`state ${kind} title`, "ink", "bg"); chk(`state ${kind} body`, "ink-2", "bg")
    chk(`state ${kind} icon`, col, kind === "error" ? "danger-bg" : kind === "offline" ? "warning-bg" : "sand", 3)
    return c
  })

  await lbl(body, "هيكل تحميل", "Loading skeleton (list row)")
  const sk = frame("skeleton-row", { comp: true, dir: "HORIZONTAL", w: 342, pad: 12, gap: 12, cross: "CENTER", fill: "paper", stroke: "line", r: "md" })
  add(sk, rect("thumb", 64, 64, "sand", "sm"))
  const lines = frame("lines", { gap: 8 }); add(lines, rect("l1", 160, 12, "sand", "pill")); add(lines, rect("l2", 110, 12, "sand", "pill")); add(sk, lines)
  defineOne(body, "skeleton-row", "Skeleton row", sk)
})

// ---- Map pin and status timeline ----------------------------------------------------------
await sectionOn(ctx, P, "sec-map-timeline", "الخريطة وتتبع الطلب · Map pin & status timeline", async body => {
  await lbl(body, "دبوس الخريطة", "Map pin")
  await defineSet(body, "map-pin", "Map pin", { type: ["address", "store", "courier"], state: ["default", "selected"] }, async ({ type, state }) => {
    const sel = state === "selected"
    const ic = { address: "map-pin", store: "storefront", courier: "truck" }[type]
    const c = frame("map-pin", { comp: true, gap: 4, cross: "CENTER" })
    if (sel) { const tip = frame("label", { dir: "HORIZONTAL", px: 12, py: 6, fill: "ink", r: "sm" }); add(tip, await txt(type === "address" ? "موقع التوصيل" : type === "store" ? "مجازر الفلاح" : "المندوب", "Label/M", "paper")); add(c, tip); chk("pin label", "paper", "ink") }
    const head = frame("head", { dir: "HORIZONTAL", w: sel ? 48 : 40, h: sel ? 48 : 40, main: "CENTER", cross: "CENTER", fill: type === "store" ? "brand" : "ember", stroke: "paper", sw: 3, r: "pill" })
    add(head, await icon(ic, sel ? 24 : 20, "paper", "fill")); add(c, head)
    add(c, rect("tail", 4, 8, type === "store" ? "brand" : "ember", 2))
    chk(`pin ${type}`, "paper", type === "store" ? "brand" : "ember", 3)
    return c
  })

  await lbl(body, "خط تتبع الحالة (عمودي، الدائرة على اليمين)", "Status timeline")
  const STEPS = [["تم استلام الطلب", "10:02 ص"], ["جارٍ التجهيز", "10:15 ص"], ["ذُبح وجُهّز", "11:30 ص"], ["في الطريق", "12:10 م"], ["تم التسليم", "12:40 م"]]
  await defineSet(body, "status-timeline", "Status timeline", { stage: ["1", "2", "3", "4", "5"] }, async ({ stage }) => {
    const cur = Number(stage) - 1
    const c = frame("status-timeline", { comp: true, w: 342, pad: 16, fill: "paper", stroke: "line", r: "md" })
    for (let i = 0; i < STEPS.length; i++) {
      const last = i === STEPS.length - 1, delivered = cur === STEPS.length - 1 // stage 5 = delivered: every step done
      const done = i < cur || delivered, now = i === cur && !delivered
      const row = frame("step", { dir: "HORIZONTAL", gap: 12 })
      const mark = frame("marker", { gap: 0, cross: "CENTER" })
      const dot = frame("dot", { dir: "HORIZONTAL", w: 24, h: 24, main: "CENTER", cross: "CENTER", fill: done ? "success" : now ? "paper" : "sand", stroke: now ? "ember" : null, sw: 3, r: "pill" })
      if (done) add(dot, await icon("check", 14, "paper")); else if (now) add(dot, circle("now", 8, "ember"))
      add(mark, dot)
      if (!last) add(mark, rect("line", 2, 28, done ? "success" : "line", 1))
      const txtCol = frame("text", { gap: 2, h: last ? 24 : 52 })
      add(txtCol, await txt(STEPS[i][0], now ? "Label/M" : "Body/M", done || now ? "ink" : "ink-2", { name: "title" }))
      if (done || now) add(txtCol, await txt(STEPS[i][1], "Caption", "ink-2", { name: "time" }))
      add(row, mark); add(row, txtCol); add(c, row)
    }
    chk("timeline text", "ink-2", "paper"); chk("timeline done dot", "paper", "success", 3); chk("timeline current ring", "ember", "paper", 3)
    return c
  })
})

figma.viewport.scrollAndZoomIntoView(page(P).children)
print("✅ batch 3a done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
