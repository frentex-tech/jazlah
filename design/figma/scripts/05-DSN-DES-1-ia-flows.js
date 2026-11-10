// DSN-DES-1, batch 5a: information architecture (customer app map, dashboard sitemaps) and the six key user flows,
// drawn on page 90 Flows. Diagrams are built from frames and text (no screens exist yet), RTL: the first step is on the right.
await loadDS()
const ctx = { y: 0 }
const P = "90 Flows"
const W = 1700

// column of an IA tree: a dark head card and a list of cards; an item can carry sub-items (indented)
async function column(title, en, items, tone = "brand") {
  const col = frame("ia/" + en, { w: 300, gap: 8 })
  const head = frame("head", { pad: 16, gap: 2, fill: tone, r: "md" })
  add(head, await txt(title, "Heading/H2", tone === "brand" ? "paper" : "ink", { w: 268 }), "h")
  add(head, await txt(en, "Caption", tone === "brand" ? "sand" : "ink-2", { w: 268, align: "RIGHT" }), "h")
  add(col, head, "h")
  for (const it of items) {
    const [t, subs = []] = Array.isArray(it) ? it : [it]
    const card = frame("item", { pad: 12, gap: 6, fill: "paper", stroke: "line", r: "sm" })
    add(card, await txt(t, "Label/M", "ink", { w: 276 }), "h")
    for (const s of subs) {
      const row = frame("sub", { dir: "HORIZONTAL", gap: 6, cross: "CENTER" })
      add(row, circle("bullet", 6, "gold-deco")); add(row, await txt(s, "Body/M", "ink-2", { w: 260 }), "h"); add(card, row, "h")
    }
    add(col, card, "h")
  }
  chk("ia head " + en, tone === "brand" ? "paper" : "ink", tone); chk("ia item", "ink", "paper"); chk("ia sub", "ink-2", "paper")
  return col
}

// one flow: numbered step cards joined by forward arrows (caret-left in RTL)
async function flow(body, ar, en, steps, note) {
  add(body, await txt(`${ar} · ${en}`, "Heading/H2"), "h")
  if (note) add(body, await txt(note, "Body/M", "ink-2"), "h")
  const row = frame("flow/" + en, { dir: "HORIZONTAL", gap: 8, cross: "MIN" })
  for (let i = 0; i < steps.length; i++) {
    const [t, sub] = steps[i]
    const card = frame("step " + (i + 1), { w: 188, pad: 14, gap: 8, fill: "paper", stroke: "line", r: "md" })
    const n = frame("n", { dir: "HORIZONTAL", w: 28, h: 28, main: "CENTER", cross: "CENTER", fill: i === steps.length - 1 ? "success" : "ember", r: "pill" })
    add(n, await txt(String(i + 1), "Label/M", "paper", { align: "CENTER" })); add(card, n)
    add(card, await txt(t, "Label/M", "ink", { w: 160 }), "h")
    add(card, await txt(sub, "Caption", "ink-2", { w: 160 }), "h")
    add(row, card)
    if (i < steps.length - 1) { const ar2 = frame("arrow", { dir: "HORIZONTAL", h: 80, cross: "CENTER" }); add(ar2, await icon("caret-left", 20, "ink-2")); add(row, ar2) }
  }
  add(body, row)
  chk("flow step title", "ink", "paper"); chk("flow step sub", "ink-2", "paper"); chk("flow step number", "paper", "ember"); chk("flow last number", "paper", "success")
}

// ---- Customer app map ---------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-ia-app", "خريطة التطبيق · Customer app map", async body => {
  add(body, await txt("التبويبات الأربعة: الرئيسية، الخدمات، الطلبات، حسابي. السلة أيقونة في الرأس وعليها عدّاد. أول فتح للتطبيق يمر بالتعريف ثم رقم الجوال ثم رمز التحقق ثم إكمال الملف.", "Body/L", "ink-2", { w: 1560 }), "h")
  const pre = frame("pre-tabs", { dir: "HORIZONTAL", gap: 8, cross: "CENTER" })
  for (const [i, t] of ["شاشة البداية", "التعريف (3 شرائح)", "رقم الجوال", "رمز التحقق", "إكمال الملف", "إذن الموقع"].entries()) {
    const c = frame("pre", { dir: "HORIZONTAL", h: 40, px: 16, cross: "CENTER", fill: "sand", r: "pill" }); add(c, await txt(t, "Label/M", "ink")); add(pre, c)
    if (i < 5) add(pre, await icon("caret-left", 16, "ink-2"))
  }
  add(body, pre); chk("pre-tabs chip", "ink", "sand")
  const cols = frame("tabs", { dir: "HORIZONTAL", gap: 24 })
  add(cols, await column("الرئيسية", "Home", [["البحث والمرشحات", ["نتائج البحث", "ورقة المرشحات"]], ["المتاجر الشريكة", ["صفحة المتجر"]], ["الأقسام", ["قائمة المنتجات"]], ["تفاصيل المنتج", ["الحجم والتقطيع والتغليف", "الاستثناءات والملاحظات", "المجموع الثابت وإضافة للسلة"]], ["السلة", ["الاستلام أو التوصيل", "اختيار اليوم", "الدفع", "تم الطلب"]], "الإشعارات"]))
  add(cols, await column("الخدمات", "Services", [["المناسبات", ["طلب مناسبة", "عرض السعر وقبوله", "العربون والمتبقي"]], ["زيارة المزارع", ["حجز زيارة", "تفاصيل الحجز والخريطة", "حيواناتي"]], ["اطبخها لي", ["الأطباق", "خيار الطبخ للمنتج"]], ["موسم الأضحية", ["الصفحة الرئيسية للموسم", "يوم الذبح", "قيود التقطيع"]], ["سوق الأعلاف", ["الإعلانات القريبة", "طلبات الشراء", "المحادثات", "إعلاناتي ونشر إعلان"]]]))
  add(cols, await column("الطلبات", "Orders", [["طلباتي", ["الحالية", "السابقة"]], ["تفاصيل الطلب", ["الخط الزمني", "بطاقة الطزاجة"]], ["تتبع الطلب", ["المندوب والخريطة"]], ["الإلغاء والاسترجاع"], ["الشكاوى", ["نموذج مع صور", "حالة الشكوى"]]]))
  add(cols, await column("حسابي", "Account", [["الملف الشخصي"], ["العناوين", ["قائمة العناوين", "إضافة على الخريطة", "خارج التغطية"]], ["الإعدادات", ["اللغة", "حذف الحساب"]], ["الإشعارات وتفضيلات التسويق"], ["الدعم والتواصل"], ["تسجيل الخروج"]]))
  add(body, cols)
}, W)

// ---- Dashboard sitemaps -----------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-ia-dash", "خرائط لوحات التحكم · Dashboard sitemaps", async body => {
  add(body, await txt("ثلاثة أدوار على نفس القائمة الجانبية والمكوّنات: الإدارة، البائع، المطبخ. صفحتا الدخول وتقديم طلب البائع عامتان.", "Body/L", "ink-2", { w: 1560 }), "h")
  const cols = frame("roles", { dir: "HORIZONTAL", gap: 24 })
  add(cols, await column("الإدارة", "Admin", [["نظرة عامة", ["مؤشرات ورسوم"]], ["الطلبات", ["القائمة والمرشحات", "التفاصيل والخط الزمني", "إلغاء واسترجاع وإعادة جدولة"]], ["العملاء", ["القائمة", "التفاصيل"]], ["المتاجر", ["قائمة الطلبات", "مراجعة المستندات والموافقة"]], ["المنتجات", ["الأقسام", "المنتجات", "طابور المراجعة"]], ["التوصيل", ["الشحنات", "إسناد يدوي", "التوصيل الفاشل", "تسويات الدفع عند الاستلام"]], ["المناسبات والزيارات والأضحية", ["مراجعة وتسعير"]], ["سوق الأعلاف", ["الإشراف على الإعلانات والمحادثات"]], ["الشكاوى"], ["المالية", ["الأرصدة", "الدفعات"]], ["الموظفون والصلاحيات", ["مصفوفة الصلاحيات"]], "سجل التدقيق", ["الإعدادات التشغيلية", ["التقويم والإغلاق", "مفتاح الإيقاف"]]]))
  add(cols, await column("البائع", "Vendor", [["لوحة الطلبات الحية", ["الأعمدة والتنبيه", "وقت الذبح وصورة الطزاجة", "ملصق A6"]], ["منتجاتي", ["القائمة", "نموذج المنتج", "ملاحظات الرفض"]], ["الأرباح", ["الملخص", "القيود", "الدفعات"]], ["ملف المتجر"], ["الإتاحة والإغلاق"], ["تقديم بائع جديد (عام)", ["الحالة"]]], "gold"))
  add(cols, await column("المطبخ", "Kitchen", [["الطلبات الجارية", ["اللوحة", "تفاصيل الطبخ"]], ["الجدول", ["الأيام والفترات"]], ["الأطباق", ["القائمة", "نموذج الطبق"]], ["الإعدادات"]], "gold"))
  add(body, cols)
}, W)

// ---- Key flows ---------------------------------------------------------------------------------------
await sectionOn(ctx, P, "sec-flows", "التدفقات الرئيسية · Key user flows", async body => {
  await flow(body, "الطلب العادي", "Regular order", [["اختيار منتج", "الرئيسية أو البحث ثم تفاصيل المنتج"], ["التخصيص", "الحجم والتقطيع والتغليف، المجموع ظاهر دائمًا"], ["السلة", "مراجعة وكمية"], ["الاستلام واليوم", "توصيل أو استلام، يوم متاح"], ["الدفع", "بطاقة أو مدى أو عند الاستلام"], ["تم الطلب", "تتبع الطلب"]],
    "ست خطوات من المنتج إلى «تم الطلب» (NFR-USB: لا تزيد عن 6).")
  await flow(body, "طلب مناسبة", "Occasion request", [["اختيار المناسبة", "عقيقة، وليمة، ..."], ["التفاصيل", "النوع والعدد والتاريخ والمدينة"], ["عرض السعر", "من المتجر بعد المراجعة"], ["قبول العرض", "مراجعة الشروط"], ["دفع العربون", "جزء من القيمة"], ["التنفيذ والتتبع", "تحديثات الحالة"], ["دفع المتبقي", "قبل التسليم"]])
  await flow(body, "زيارة المزرعة", "Farm visit", [["اختيار المزرعة", "من الخدمات"], ["حجز موعد", "اليوم والفترة وعدد الزوار"], ["تأكيد الحجز", "تفاصيل وخريطة"], ["الزيارة", "اختيار الحيوان"], ["حيواناتي", "عربون وجدولة التنفيذ"]])
  await flow(body, "اطبخها لي", "Cook it for me", [["اختيار المنتج", "لحم أو ذبيحة"], ["خيار الطبخ", "اطبخها لي"], ["اختيار الطبق", "من قائمة المطبخ"], ["الموعد", "يوم وفترة"], ["الدفع", "شامل التجهيز"], ["التحضير", "حالة الطبخ"], ["التسليم", "توصيل أو استلام"]])
  await flow(body, "الأضحية", "Adha booking", [["صفحة الموسم", "العروض والمواعيد"], ["اختيار الأضحية", "النوع والوزن"], ["يوم الذبح", "الأيام المتاحة"], ["قيود التقطيع", "خيارات التقطيع المسموحة"], ["العربون", "تأكيد الحجز"], ["الاستلام", "يوم الذبح"]])
  await flow(body, "الأعلاف والمحادثة", "Feed listing + chat", [["سوق الأعلاف", "الإعلانات القريبة"], ["تفاصيل الإعلان", "المعرض والسعر والبائع"], ["بدء محادثة", "رسالة أولى"], ["المحادثة", "نص وصور، إبلاغ أو حظر"], ["الاتفاق", "تواصل خارج المنصة"]],
    "مسار البائع: طلب بائع أعلاف، مراجعة، نشر إعلان، إدارة إعلاناتي، الرد على المحادثات.")
}, W)

figma.viewport.scrollAndZoomIntoView(page(P).children)
print("✅ batch 5a done\n" + ctx.ids.join("\n") + "\n" + contrastReport())
