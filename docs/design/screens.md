# Screen inventory

Every launch screen in the Figma file [Jazlah — Product Design](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design): its Arabic name, its Figma link, and the task that will build it. 668 screens on 7 area pages plus the `Design System` page (generated from the file with `design/figma/scripts/36-export-index.js`; tasks matched by feature against `docs/delivery/sprints/`).

How the file is laid out: one page per product area, in this order. On each page the first row is the app (mobile), the second row is the web twin of each app screen directly under it, the third row is that area's dashboard. Every screen carries only its Arabic name above it. Screens are Arabic RTL only; English comes from mirroring and i18n (rules on the `Design System` page).

| Page | App | Web | Dashboard | Open |
|---|---|---|---|---|
| 01 الحساب والدخول | 39 | 20 | 6 | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6633) |
| 02 المتجر والطلب | 99 | 62 | 0 | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6634) |
| 03 المواعيد والزيارة | 22 | 8 | 10 | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6635) |
| 04 المناسبات والأضاحي | 50 | 18 | 29 | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6636) |
| 05 الأعلاف والمحادثة | 65 | 8 | 18 | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6637) |
| 06 البائع | 0 | 20 | 52 | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6638) |
| 07 الإدارة | 0 | 0 | 142 | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6639) |
| Design System | | | | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6640) |

## Prototype flows

Each flow has a starting point on the page of its first screen (Present ▶ from that screen).

| Flow | Page | Starts at |
|---|---|---|
| الحساب: أول تشغيل ← الملف الشخصي | 01 الحساب والدخول | [التعريف: الشريحة الأولى](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-28039) |
| الطلب: الرئيسية ← المنتج ← السلة ← الدفع ← تم الطلب | 02 المتجر والطلب | [الرئيسية](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-6999) |
| الطلب (ويب): الرئيسية ← المنتج ← السلة ← الدفع ← تم الطلب | 02 المتجر والطلب | [الرئيسية](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13360) |
| زيارة المزرعة: الحجز ← التأكيد | 03 المواعيد والزيارة | [حجز زيارة · معبّأة](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73077) |
| المناسبات: الطلب ← العرض ← العربون | 04 المناسبات والأضاحي | [طلب مناسبة: النوع · معبّأة](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71063) |
| الطبخ: الأطباق ← اطبخها لي | 04 المناسبات والأضاحي | [الأطباق الجاهزة](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74505) |
| الأضاحي: الصفحة ← اليوم ← التقطيع | 04 المناسبات والأضاحي | [موسم الأضحى](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75170) |
| سوق الأعلاف: الإعلانات ← الإعلان ← المحادثة | 05 الأعلاف والمحادثة | [سوق الأعلاف](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48754) |
| يوم البائع: اللوحة ← وقت الذبح ← الصور ← الملصق ← الأرباح | 06 البائع | [لوحة الطلبات المباشرة](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-39184) |
| يوم الإدارة: النظرة العامة ← الطلبات ← الشكاوى ← المالية | 07 الإدارة | [نظرة عامة](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-46622) |

## [01 الحساب والدخول](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6633)

### التطبيق (جوال) · Customer app (mobile) (39)

| Screen | Figma | Implementing task |
|---|---|---|
| التعريف: الشريحة الأولى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-28039) | ACC-MOB-1 (#19) |
| التعريف: الشريحة الثانية | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-2588) | ACC-MOB-1 (#19) |
| التعريف: الشريحة الثالثة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-2651) | ACC-MOB-1 (#19) |
| التعريف: الشريحة الأولى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-2712) | ACC-MOB-1 (#19) |
| رقم الجوال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-2794) | ACC-MOB-1 (#19) |
| رقم الجوال · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-3110) | ACC-MOB-1 (#19) |
| رقم الجوال · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-2879) | ACC-MOB-1 (#19) |
| رقم الجوال · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-2994) | ACC-MOB-1 (#19) |
| رمز التحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-3227) | ACC-MOB-1 (#19) |
| رمز التحقق · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-3316) | ACC-MOB-1 (#19) |
| رمز التحقق · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-3435) | ACC-MOB-1 (#19) |
| رمز التحقق · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-3555) | ACC-MOB-1 (#19) |
| إكمال الملف الشخصي | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-3677) | ACC-MOB-1 (#19) |
| إكمال الملف الشخصي · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-3754) | ACC-MOB-1 (#19) |
| إكمال الملف الشخصي · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-3850) | ACC-MOB-1 (#19) |
| إكمال الملف الشخصي · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-3946) | ACC-MOB-1 (#19) |
| الإعدادات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-8608) | ACC-MOB-1 (#19), NOT-MOB-1 (#105) |
| الإعدادات · تأكيد الحذف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-8667) | ACC-MOB-1 (#19), NOT-MOB-1 (#105) |
| الإعدادات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-8735) | ACC-MOB-1 (#19), NOT-MOB-1 (#105) |
| الإعدادات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-8791) | ACC-MOB-1 (#19), NOT-MOB-1 (#105) |
| العناوين | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-8871) | ACC-MOB-3 (#20) |
| العناوين · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-8947) | ACC-MOB-3 (#20) |
| العناوين · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9041) | ACC-MOB-3 (#20) |
| العناوين · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9115) | ACC-MOB-3 (#20) |
| تعديل العنوان | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9219) | ACC-MOB-3 (#20) |
| تعديل العنوان · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9264) | ACC-MOB-3 (#20) |
| تعديل العنوان · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9334) | ACC-MOB-3 (#20) |
| إضافة عنوان على الخريطة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3340) | LOC-MOB-1 (#26), ACC-MOB-3 (#20) |
| إضافة عنوان على الخريطة · جارٍ البحث | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3383) | LOC-MOB-1 (#26), ACC-MOB-3 (#20) |
| إضافة عنوان على الخريطة · خارج النطاق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3439) | LOC-MOB-1 (#26), ACC-MOB-3 (#20) |
| إضافة عنوان على الخريطة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3490) | LOC-MOB-1 (#26), ACC-MOB-3 (#20) |
| إضافة عنوان على الخريطة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3535) | LOC-MOB-1 (#26), ACC-MOB-3 (#20) |
| إذن الموقع | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3583) | LOC-MOB-1 (#26) |
| إذن الموقع · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3642) | LOC-MOB-1 (#26) |
| إذن الموقع · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3701) | LOC-MOB-1 (#26) |
| إذن الموقع · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3762) | LOC-MOB-1 (#26) |
| خارج النطاق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3823) | LOC-MOB-1 (#26) |
| خارج النطاق · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3864) | LOC-MOB-1 (#26) |
| خارج النطاق · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-3907) | LOC-MOB-1 (#26) |

### الويب · Customer web (20)

| Screen | Figma | Implementing task |
|---|---|---|
| رقم الجوال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-4045) | ACC-WEB-1 (#21) |
| رقم الجوال · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-4082) | ACC-WEB-1 (#21) |
| رقم الجوال · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-4119) | ACC-WEB-1 (#21) |
| رمز التحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-5742) | ACC-WEB-1 (#21) |
| رمز التحقق · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-5779) | ACC-WEB-1 (#21) |
| رمز التحقق · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-5821) | ACC-WEB-1 (#21) |
| إكمال الملف الشخصي | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-5865) | ACC-WEB-1 (#21) |
| إكمال الملف الشخصي · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-5906) | ACC-WEB-1 (#21) |
| إكمال الملف الشخصي · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=123-5947) | ACC-WEB-1 (#21) |
| الإعدادات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-10172) | ACC-WEB-1 (#21) |
| الإعدادات · تأكيد الحذف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-10218) | ACC-WEB-1 (#21) |
| الإعدادات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-10273) | ACC-WEB-1 (#21) |
| الإعدادات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-10319) | ACC-WEB-1 (#21) |
| العناوين | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9770) | ACC-WEB-1 (#21) |
| العناوين · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9844) | ACC-WEB-1 (#21) |
| العناوين · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9885) | ACC-WEB-1 (#21) |
| العناوين · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9943) | ACC-WEB-1 (#21) |
| إضافة وتعديل العنوان | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-9977) | ACC-WEB-1 (#21), LOC-WEB-1 (#27) |
| إضافة وتعديل العنوان · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-10041) | ACC-WEB-1 (#21), LOC-WEB-1 (#27) |
| إضافة وتعديل العنوان · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-10105) | ACC-WEB-1 (#21), LOC-WEB-1 (#27) |

### لوحات التحكم · Dashboards (6)

| Screen | Figma | Implementing task |
|---|---|---|
| دخول الإدارة: رقم الجوال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-5934) | ACC-DSH-1 (#22) |
| دخول الإدارة: رقم الجوال · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-5954) | ACC-DSH-1 (#22) |
| دخول الإدارة: رقم الجوال · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-5974) | ACC-DSH-1 (#22) |
| دخول الإدارة: رمز التحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-6922) | ACC-DSH-1 (#22) |
| دخول الإدارة: رمز التحقق · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-6942) | ACC-DSH-1 (#22) |
| دخول الإدارة: رمز التحقق · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-6967) | ACC-DSH-1 (#22) |

## [02 المتجر والطلب](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6634)

### التطبيق (جوال) · Customer app (mobile) (99)

| Screen | Figma | Implementing task |
|---|---|---|
| الرئيسية | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-6999) | STF-MOB-1 (#55) |
| الرئيسية · تمرير | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-7219) | STF-MOB-1 (#55) |
| الرئيسية · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-7661) | STF-MOB-1 (#55) |
| الرئيسية · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-7740) | STF-MOB-1 (#55) |
| الرئيسية · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-7802) | STF-MOB-1 (#55) |
| الرئيسية · بلا اتصال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-7854) | STF-MOB-1 (#55) |
| الرئيسية · مغلق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-7439) | STF-MOB-1 (#55) |
| الأقسام | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-7909) | STF-MOB-1 (#55) |
| الأقسام · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8015) | STF-MOB-1 (#55) |
| الأقسام · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8092) | STF-MOB-1 (#55) |
| الأقسام · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8137) | STF-MOB-1 (#55) |
| صفحة المتجر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8184) | STF-MOB-1 (#55) |
| صفحة المتجر · تمرير | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8326) | STF-MOB-1 (#55) |
| صفحة المتجر · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8612) | STF-MOB-1 (#55) |
| صفحة المتجر · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8653) | STF-MOB-1 (#55) |
| صفحة المتجر · مغلق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8468) | STF-MOB-1 (#55) |
| صفحة المتجر · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8705) | STF-MOB-1 (#55) |
| تفاصيل المنتج | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8735) | STF-MOB-3 (#56) |
| تفاصيل المنتج · تمرير | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-8897) | STF-MOB-3 (#56) |
| تفاصيل المنتج · تفاصيل السعر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-9059) | STF-MOB-3 (#56) |
| تفاصيل المنتج · خيار غير متوافق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-9254) | STF-MOB-3 (#56) |
| تفاصيل المنتج · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-9496) | STF-MOB-3 (#56) |
| تفاصيل المنتج · نفد المخزون | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-9350) | STF-MOB-3 (#56) |
| تفاصيل المنتج · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-9545) | STF-MOB-3 (#56) |
| تفاصيل المنتج · خطأ الإضافة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-9573) | STF-MOB-3 (#56) |
| البحث | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-12826) | STF-MOB-4 (#57) |
| البحث · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-12881) | STF-MOB-4 (#57) |
| نتائج البحث | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-12931) | STF-MOB-4 (#57) |
| نتائج البحث · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13056) | STF-MOB-4 (#57) |
| نتائج البحث · لا نتائج | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13112) | STF-MOB-4 (#57) |
| نتائج البحث · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13149) | STF-MOB-4 (#57) |
| نتائج البحث · بلا اتصال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13186) | STF-MOB-4 (#57) |
| التصفية | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13223) | STF-MOB-4 (#57) |
| السلة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-28564) | CRT-MOB-1 (#64) |
| السلة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-28643) | CRT-MOB-1 (#64) |
| السلة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-28708) | CRT-MOB-1 (#64) |
| السلة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-28782) | CRT-MOB-1 (#64) |
| السلة · معطّلة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-28847) | CRT-MOB-1 (#64) |
| الدفع: الاستلام واليوم | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-9638) | SCH-MOB-1 (#71) |
| الدفع: الاستلام واليوم · استلام من المتجر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-9741) | SCH-MOB-1 (#71) |
| الدفع: الاستلام واليوم · اختيار اليوم | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-9829) | SCH-MOB-1 (#71) |
| الدفع: الاستلام واليوم · متوقف مؤقتًا | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10052) | SCH-MOB-1 (#71) |
| الدفع: الاستلام واليوم · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10144) | SCH-MOB-1 (#71) |
| الدفع: الاستلام واليوم · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10199) | SCH-MOB-1 (#71) |
| الدفع: الاستلام واليوم · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10251) | SCH-MOB-1 (#71) |
| الدفع والمراجعة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-28952) | PAY-MOB-1 (#78) |
| الدفع والمراجعة · مختارة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29025) | PAY-MOB-1 (#78) |
| الدفع والمراجعة · جارٍ المعالجة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29134) | PAY-MOB-1 (#78) |
| الدفع والمراجعة · فشل الدفع | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29244) | PAY-MOB-1 (#78) |
| الدفع والمراجعة · معطّلة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29357) | PAY-MOB-1 (#78) |
| تم الطلب | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29472) | ORD-MOB-1 (#84) |
| الطلبات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63663) | ORD-MOB-2 (#85) |
| الطلبات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63749) | ORD-MOB-2 (#85) |
| الطلبات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63826) | ORD-MOB-2 (#85) |
| الطلبات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63940) | ORD-MOB-2 (#85) |
| الطلبات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64028) | ORD-MOB-2 (#85) |
| تفاصيل الطلب | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64128) | ORD-MOB-2 (#85), DLV-MOB-1 (#101) |
| تفاصيل الطلب · قبل الشحن | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64189) | ORD-MOB-2 (#85), DLV-MOB-1 (#101) |
| تفاصيل الطلب · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64272) | ORD-MOB-2 (#85), DLV-MOB-1 (#101) |
| تفاصيل الطلب · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64339) | ORD-MOB-2 (#85), DLV-MOB-1 (#101) |
| تفاصيل الطلب · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64401) | ORD-MOB-2 (#85), DLV-MOB-1 (#101) |
| تتبع الطلب | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64472) | ORD-MOB-2 (#85), DLV-MOB-1 (#101) |
| تتبع الطلب · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64553) | ORD-MOB-2 (#85), DLV-MOB-1 (#101) |
| تتبع الطلب · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64644) | ORD-MOB-2 (#85), DLV-MOB-1 (#101) |
| تتبع الطلب · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64730) | ORD-MOB-2 (#85), DLV-MOB-1 (#101) |
| سبب الإلغاء | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64828) | CAN-MOB-1 (#94) |
| الاسترداد | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64871) | CAN-MOB-1 (#94) |
| الاسترداد · تأكيد | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64931) | CAN-MOB-1 (#94) |
| الاسترداد · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65023) | CAN-MOB-1 (#94) |
| الاسترداد · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65116) | CAN-MOB-1 (#94) |
| الاسترداد · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65212) | CAN-MOB-1 (#94) |
| تم الإلغاء | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-64992) | CAN-MOB-1 (#94) |
| تقديم شكوى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65288) | CAN-MOB-1 (#94) |
| تقديم شكوى · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65334) | CAN-MOB-1 (#94) |
| تقديم شكوى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65405) | CAN-MOB-1 (#94) |
| تقديم شكوى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65474) | CAN-MOB-1 (#94) |
| تقديم شكوى · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65546) | CAN-MOB-1 (#94) |
| حالة الشكوى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65609) | CAN-MOB-1 (#94) |
| حالة الشكوى · تم الحل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65664) | CAN-MOB-1 (#94) |
| حالة الشكوى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65741) | CAN-MOB-1 (#94) |
| حالة الشكوى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65797) | CAN-MOB-1 (#94) |
| الشكاوى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65848) | CAN-MOB-1 (#94) |
| الشكاوى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65884) | CAN-MOB-1 (#94) |
| الشكاوى · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65927) | CAN-MOB-1 (#94) |
| الشكاوى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-65980) | CAN-MOB-1 (#94) |
| مركز الإشعارات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66025) | NOT-MOB-1 (#105) |
| مركز الإشعارات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66098) | NOT-MOB-1 (#105) |
| مركز الإشعارات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66173) | NOT-MOB-1 (#105) |
| مركز الإشعارات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66248) | NOT-MOB-1 (#105) |
| مركز الإشعارات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66313) | NOT-MOB-1 (#105) |
| التواصل مع الدعم | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66390) | NOT-MOB-1 (#105) |
| التواصل مع الدعم · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66454) | NOT-MOB-1 (#105) |
| التواصل مع الدعم · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66522) | NOT-MOB-1 (#105) |
| التواصل مع الدعم · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66585) | NOT-MOB-1 (#105) |
| الموافقة على العروض | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66660) | NOT-MOB-1 (#105) |
| الموافقة على العروض · نافذة الطلب الأول | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66708) | NOT-MOB-1 (#105) |
| الموافقة على العروض · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66782) | NOT-MOB-1 (#105) |
| الموافقة على العروض · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66836) | NOT-MOB-1 (#105) |
| الموافقة على العروض · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-66880) | NOT-MOB-1 (#105) |

### الويب · Customer web (62)

| Screen | Figma | Implementing task |
|---|---|---|
| الرئيسية | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13360) | STF-WEB-1 (#58) |
| الرئيسية · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13649) | STF-WEB-1 (#58) |
| الرئيسية · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13734) | STF-WEB-1 (#58) |
| الرئيسية · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13774) | STF-WEB-1 (#58) |
| الأقسام | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-13806) | STF-WEB-1 (#58) |
| الأقسام · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-14095) | STF-WEB-1 (#58) |
| الأقسام · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-14234) | STF-WEB-1 (#58) |
| الأقسام · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-14319) | STF-WEB-1 (#58) |
| صفحة المتجر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-14406) | STF-WEB-1 (#58) |
| صفحة المتجر · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-14713) | STF-WEB-1 (#58) |
| صفحة المتجر · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-14779) | STF-WEB-1 (#58) |
| صفحة المتجر · مغلق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-14829) | STF-WEB-1 (#58) |
| صفحة المتجر · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-15002) | STF-WEB-1 (#58) |
| تفاصيل المنتج | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-15034) | STF-WEB-2 (#59) |
| تفاصيل المنتج · خيار غير متوافق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-15212) | STF-WEB-2 (#59) |
| تفاصيل المنتج · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-15574) | STF-WEB-2 (#59) |
| تفاصيل المنتج · نفد المخزون | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-15396) | STF-WEB-2 (#59) |
| تفاصيل المنتج · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-15620) | STF-WEB-2 (#59) |
| نتائج البحث | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-15652) | STF-WEB-2 (#59) |
| نتائج البحث · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-15941) | STF-WEB-2 (#59) |
| نتائج البحث · لا نتائج | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-16080) | STF-WEB-2 (#59) |
| نتائج البحث · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=86-16165) | STF-WEB-2 (#59) |
| السلة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29522) | CRT-WEB-1 (#65) |
| السلة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29602) | CRT-WEB-1 (#65) |
| السلة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29633) | CRT-WEB-1 (#65) |
| السلة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29668) | CRT-WEB-1 (#65) |
| السلة · معطّلة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29699) | CRT-WEB-1 (#65) |
| الدفع: الاستلام واليوم | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10595) | SCH-WEB-1 (#72) |
| الدفع: الاستلام واليوم · استلام من المتجر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10731) | SCH-WEB-1 (#72) |
| الدفع: الاستلام واليوم · متوقف مؤقتًا | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10867) | SCH-WEB-1 (#72) |
| الدفع: الاستلام واليوم · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-11007) | SCH-WEB-1 (#72) |
| الدفع: الاستلام واليوم · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-11059) | SCH-WEB-1 (#72) |
| الدفع والمراجعة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29773) | ORD-WEB-1 (#86) |
| الدفع والمراجعة · مختارة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29864) | ORD-WEB-1 (#86) |
| الدفع والمراجعة · جارٍ المعالجة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-29956) | ORD-WEB-1 (#86) |
| الدفع والمراجعة · فشل الدفع | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-30049) | ORD-WEB-1 (#86) |
| الدفع والمراجعة · معطّلة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-30145) | ORD-WEB-1 (#86) |
| تم الطلب | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=170-30243) | ORD-WEB-1 (#86) |
| تفاصيل الطلب | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37124) | ORD-WEB-2 (#87), DLV-WEB-1 (#102) |
| تفاصيل الطلب · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37244) | ORD-WEB-2 (#87), DLV-WEB-1 (#102) |
| تفاصيل الطلب · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37328) | ORD-WEB-2 (#87), DLV-WEB-1 (#102) |
| تفاصيل الطلب · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37405) | ORD-WEB-2 (#87), DLV-WEB-1 (#102) |
| الاسترداد | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37494) | CAN-WEB-1 (#95) |
| الاسترداد · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37577) | CAN-WEB-1 (#95) |
| الاسترداد · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37702) | CAN-WEB-1 (#95) |
| الاسترداد · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37829) | CAN-WEB-1 (#95) |
| تقديم شكوى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37912) | CAN-WEB-1 (#95) |
| تقديم شكوى · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-37988) | CAN-WEB-1 (#95) |
| تقديم شكوى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38098) | CAN-WEB-1 (#95) |
| تقديم شكوى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38206) | CAN-WEB-1 (#95) |
| تقديم شكوى · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38317) | CAN-WEB-1 (#95) |
| تقديم شكوى · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38389) | CAN-WEB-1 (#95) |
| مركز الإشعارات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38463) | DLV-WEB-1 (#102) |
| مركز الإشعارات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38539) | DLV-WEB-1 (#102) |
| مركز الإشعارات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38617) | DLV-WEB-1 (#102) |
| مركز الإشعارات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38692) | DLV-WEB-1 (#102) |
| مركز الإشعارات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38759) | DLV-WEB-1 (#102) |
| التواصل مع الدعم | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38837) | DLV-WEB-1 (#102) |
| التواصل مع الدعم · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-39003) | DLV-WEB-1 (#102) |
| التواصل مع الدعم · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-39064) | DLV-WEB-1 (#102) |
| التواصل مع الدعم · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-39127) | DLV-WEB-1 (#102) |
| التواصل مع الدعم · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-38907) | DLV-WEB-1 (#102) |

## [03 المواعيد والزيارة](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6635)

### التطبيق (جوال) · Customer app (mobile) (22)

| Screen | Figma | Implementing task |
|---|---|---|
| الدفع: الاستلام واليوم · اليوم مغلق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10342) | SCH-MOB-1 (#71) |
| الدفع: الاستلام واليوم · اليوم مكتمل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10426) | SCH-MOB-1 (#71) |
| الدفع: الاستلام واليوم · تجاوز وقت الحجز | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-10510) | SCH-MOB-1 (#71) |
| حجز زيارة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72999) | VIS-MOB-1 (#169) |
| حجز زيارة · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73077) | VIS-MOB-1 (#169) |
| حجز زيارة · اليوم مكتمل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73155) | VIS-MOB-1 (#169) |
| حجز زيارة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73235) | VIS-MOB-1 (#169) |
| حجز زيارة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73274) | VIS-MOB-1 (#169) |
| حجز زيارة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73312) | VIS-MOB-1 (#169) |
| تفاصيل حجز الزيارة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73341) | VIS-MOB-1 (#169) |
| تفاصيل حجز الزيارة · ملغاة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73396) | VIS-MOB-1 (#169) |
| تفاصيل حجز الزيارة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73449) | VIS-MOB-1 (#169) |
| تفاصيل حجز الزيارة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73488) | VIS-MOB-1 (#169) |
| مواشيّ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73517) | VIS-MOB-1 (#169) |
| مواشيّ · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73587) | VIS-MOB-1 (#169) |
| مواشيّ · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73643) | VIS-MOB-1 (#169) |
| مواشيّ · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73698) | VIS-MOB-1 (#169) |
| تفاصيل الحيوان | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73744) | VIS-MOB-1 (#169) |
| تفاصيل الحيوان · تم دفع العربون | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73817) | VIS-MOB-1 (#169) |
| تفاصيل الحيوان · تم تحديد الموعد | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73884) | VIS-MOB-1 (#169) |
| تفاصيل الحيوان · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73951) | VIS-MOB-1 (#169) |
| تفاصيل الحيوان · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-73990) | VIS-MOB-1 (#169) |

### الويب · Customer web (8)

| Screen | Figma | Implementing task |
|---|---|---|
| حجز زيارة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74029) | VIS-WEB-1 (#171) |
| حجز زيارة · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74125) | VIS-WEB-1 (#171) |
| حجز زيارة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74221) | VIS-WEB-1 (#171) |
| حجز زيارة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74266) | VIS-WEB-1 (#171) |
| تفاصيل حجز الزيارة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74296) | VIS-WEB-1 (#171) |
| تفاصيل حجز الزيارة · ملغاة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74362) | VIS-WEB-1 (#171) |
| تفاصيل حجز الزيارة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74426) | VIS-WEB-1 (#171) |
| تفاصيل حجز الزيارة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74471) | VIS-WEB-1 (#171) |

### لوحات التحكم · Dashboards (10)

| Screen | Figma | Implementing task |
|---|---|---|
| جدول الزيارات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78708) | VIS-DSH-1 (#168) |
| جدول الزيارات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78806) | VIS-DSH-1 (#168) |
| جدول الزيارات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78865) | VIS-DSH-1 (#168) |
| جدول الزيارات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78936) | VIS-DSH-1 (#168) |
| جدول الزيارات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79000) | VIS-DSH-1 (#168) |
| تسجيل الحيوان | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79063) | VIS-DSH-1 (#168) |
| تسجيل الحيوان · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79166) | VIS-DSH-1 (#168) |
| تسجيل الحيوان · تحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79275) | VIS-DSH-1 (#168) |
| تسجيل الحيوان · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79384) | VIS-DSH-1 (#168) |
| تسجيل الحيوان · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79443) | VIS-DSH-1 (#168) |

## [04 المناسبات والأضاحي](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6636)

### التطبيق (جوال) · Customer app (mobile) (50)

| Screen | Figma | Implementing task |
|---|---|---|
| طلب مناسبة: النوع | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71002) | OCC-MOB-1 (#124) |
| طلب مناسبة: النوع · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71063) | OCC-MOB-1 (#124) |
| طلب مناسبة: النوع · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71124) | OCC-MOB-1 (#124) |
| طلب مناسبة: النوع · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71169) | OCC-MOB-1 (#124) |
| طلب مناسبة: النوع · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71216) | OCC-MOB-1 (#124) |
| طلب مناسبة: التفاصيل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71251) | OCC-MOB-1 (#124) |
| طلب مناسبة: التفاصيل · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71314) | OCC-MOB-1 (#124) |
| طلب مناسبة: التفاصيل · تحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71377) | OCC-MOB-1 (#124) |
| طلب مناسبة: التفاصيل · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71440) | OCC-MOB-1 (#124) |
| طلب مناسبة: التفاصيل · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71485) | OCC-MOB-1 (#124) |
| طلب مناسبة: الموعد والمدينة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71520) | OCC-MOB-1 (#124) |
| طلب مناسبة: الموعد والمدينة · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71591) | OCC-MOB-1 (#124) |
| طلب مناسبة: الموعد والمدينة · خارج النطاق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71663) | OCC-MOB-1 (#124) |
| طلب مناسبة: الموعد والمدينة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71734) | OCC-MOB-1 (#124) |
| طلب مناسبة: الموعد والمدينة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71779) | OCC-MOB-1 (#124) |
| طلب مناسبة: الموعد والمدينة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71826) | OCC-MOB-1 (#124) |
| عرض السعر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71861) | OCC-MOB-1 (#124) |
| عرض السعر · منتهي | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71918) | OCC-MOB-1 (#124) |
| عرض السعر · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-71979) | OCC-MOB-1 (#124) |
| عرض السعر · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72018) | OCC-MOB-1 (#124) |
| عرض السعر · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72059) | OCC-MOB-1 (#124) |
| دفع العربون والمتبقي | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72088) | OCC-MOB-1 (#124), PAY-MOB-1 (#78) |
| دفع العربون والمتبقي · تم دفع العربون | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72146) | OCC-MOB-1 (#124), PAY-MOB-1 (#78) |
| دفع العربون والمتبقي · المتبقي مقفل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72204) | OCC-MOB-1 (#124), PAY-MOB-1 (#78) |
| دفع العربون والمتبقي · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72268) | OCC-MOB-1 (#124), PAY-MOB-1 (#78) |
| دفع العربون والمتبقي · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72307) | OCC-MOB-1 (#124), PAY-MOB-1 (#78) |
| الأطباق الجاهزة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74505) | KIT-MOB-1 (#129) |
| الأطباق الجاهزة · طبق غير متاح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74643) | KIT-MOB-1 (#129) |
| الأطباق الجاهزة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74781) | KIT-MOB-1 (#129) |
| الأطباق الجاهزة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74837) | KIT-MOB-1 (#129) |
| الأطباق الجاهزة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74892) | KIT-MOB-1 (#129) |
| اطبخها لي | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74938) | KIT-MOB-1 (#129) |
| اطبخها لي · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-74993) | KIT-MOB-1 (#129) |
| اطبخها لي · الموعد غير متاح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75048) | KIT-MOB-1 (#129) |
| اطبخها لي · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75102) | KIT-MOB-1 (#129) |
| اطبخها لي · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75141) | KIT-MOB-1 (#129) |
| موسم الأضحى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75170) | ADH-MOB-1 (#133) |
| موسم الأضحى · الحجز مغلق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75247) | ADH-MOB-1 (#133) |
| موسم الأضحى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75324) | ADH-MOB-1 (#133) |
| موسم الأضحى · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75380) | ADH-MOB-1 (#133) |
| موسم الأضحى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75435) | ADH-MOB-1 (#133) |
| يوم ذبح الأضحية | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75481) | ADH-MOB-1 (#133) |
| يوم ذبح الأضحية · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75535) | ADH-MOB-1 (#133) |
| يوم ذبح الأضحية · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75589) | ADH-MOB-1 (#133) |
| يوم ذبح الأضحية · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75628) | ADH-MOB-1 (#133) |
| يوم ذبح الأضحية · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75665) | ADH-MOB-1 (#133) |
| قيود التقطيع | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75695) | ADH-MOB-1 (#133) |
| قيود التقطيع · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75749) | ADH-MOB-1 (#133) |
| قيود التقطيع · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75803) | ADH-MOB-1 (#133) |
| قيود التقطيع · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75842) | ADH-MOB-1 (#133) |

### الويب · Customer web (18)

| Screen | Figma | Implementing task |
|---|---|---|
| طلب مناسبة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72349) | SVC-WEB-1 (#135) |
| طلب مناسبة · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72440) | SVC-WEB-1 (#135) |
| طلب مناسبة · تحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72531) | SVC-WEB-1 (#135) |
| طلب مناسبة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72622) | SVC-WEB-1 (#135) |
| طلب مناسبة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72667) | SVC-WEB-1 (#135) |
| عرض السعر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72697) | SVC-WEB-1 (#135) |
| عرض السعر · منتهي | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72787) | SVC-WEB-1 (#135) |
| عرض السعر · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72880) | SVC-WEB-1 (#135) |
| عرض السعر · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72925) | SVC-WEB-1 (#135) |
| عرض السعر · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-72964) | SVC-WEB-1 (#135) |
| موسم الأضحى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75883) | SVC-WEB-1 (#135) |
| موسم الأضحى · الحجز مغلق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-75948) | SVC-WEB-1 (#135) |
| موسم الأضحى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76013) | SVC-WEB-1 (#135) |
| موسم الأضحى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76058) | SVC-WEB-1 (#135) |
| يوم الذبح والتقطيع | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76088) | SVC-WEB-1 (#135) |
| يوم الذبح والتقطيع · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76171) | SVC-WEB-1 (#135) |
| يوم الذبح والتقطيع · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76254) | SVC-WEB-1 (#135) |
| يوم الذبح والتقطيع · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76299) | SVC-WEB-1 (#135) |

### لوحات التحكم · Dashboards (29)

| Screen | Figma | Implementing task |
|---|---|---|
| طلبات المناسبات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76333) | OCC-DSH-1 (#123) |
| طلبات المناسبات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76504) | OCC-DSH-1 (#123) |
| طلبات المناسبات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76575) | OCC-DSH-1 (#123) |
| طلبات المناسبات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76659) | OCC-DSH-1 (#123) |
| طلبات المناسبات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76734) | OCC-DSH-1 (#123) |
| تسعير المناسبة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76809) | OCC-DSH-1 (#123) |
| تسعير المناسبة · تم إرسال العرض | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-76937) | OCC-DSH-1 (#123) |
| تسعير المناسبة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77071) | OCC-DSH-1 (#123) |
| تسعير المناسبة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77142) | OCC-DSH-1 (#123) |
| تسعير المناسبة · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77217) | OCC-DSH-1 (#123) |
| المطابخ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77292) | KIT-DSH-1 (#128) |
| المطابخ · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77428) | KIT-DSH-1 (#128) |
| المطابخ · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77499) | KIT-DSH-1 (#128) |
| المطابخ · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77583) | KIT-DSH-1 (#128) |
| المطابخ · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77658) | KIT-DSH-1 (#128) |
| إعدادات الأضحى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77733) | ADH-DSH-1 (#132) |
| إعدادات الأضحى · تحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-77875) | ADH-DSH-1 (#132) |
| إعدادات الأضحى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78017) | ADH-DSH-1 (#132) |
| إعدادات الأضحى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78088) | ADH-DSH-1 (#132) |
| إعدادات الأضحى · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78163) | ADH-DSH-1 (#132) |
| لوحة أيام الأضحى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78238) | ADH-DSH-1 (#132) |
| لوحة أيام الأضحى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78403) | ADH-DSH-1 (#132) |
| لوحة أيام الأضحى · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78474) | ADH-DSH-1 (#132) |
| لوحة أيام الأضحى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78558) | ADH-DSH-1 (#132) |
| لوحة أيام الأضحى · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-78633) | ADH-DSH-1 (#132) |
| لوحة المطبخ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79506) | KIT-DSH-1 (#128) |
| لوحة المطبخ · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79598) | KIT-DSH-1 (#128) |
| لوحة المطبخ · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79653) | KIT-DSH-1 (#128) |
| لوحة المطبخ · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-79720) | KIT-DSH-1 (#128) |

## [05 الأعلاف والمحادثة](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6637)

### التطبيق (جوال) · Customer app (mobile) (65)

| Screen | Figma | Implementing task |
|---|---|---|
| سوق الأعلاف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48754) | FED-MOB-1 (#152) |
| سوق الأعلاف · مفلترة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48791) | FED-MOB-1 (#152) |
| سوق الأعلاف · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48812) | FED-MOB-1 (#152) |
| سوق الأعلاف · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48833) | FED-MOB-1 (#152) |
| سوق الأعلاف · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48854) | FED-MOB-1 (#152) |
| سوق الأعلاف · بلا اتصال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48875) | FED-MOB-1 (#152) |
| تصفية الإعلانات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-49197) | FED-MOB-1 (#152) |
| تصفية الإعلانات · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-49375) | FED-MOB-1 (#152) |
| تصفية الإعلانات · لا نتائج | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-49555) | FED-MOB-1 (#152) |
| تصفية الإعلانات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-49736) | FED-MOB-1 (#152) |
| تصفية الإعلانات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-49916) | FED-MOB-1 (#152) |
| طلبات الشراء | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50100) | FED-MOB-1 (#152) |
| طلبات الشراء · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50137) | FED-MOB-1 (#152) |
| طلبات الشراء · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50158) | FED-MOB-1 (#152) |
| طلبات الشراء · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50179) | FED-MOB-1 (#152) |
| نموذج طلب شراء | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50341) | FED-MOB-1 (#152) |
| نموذج طلب شراء · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50361) | FED-MOB-1 (#152) |
| نموذج طلب شراء · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50381) | FED-MOB-1 (#152) |
| نموذج طلب شراء · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50401) | FED-MOB-1 (#152) |
| نموذج طلب شراء · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50421) | FED-MOB-1 (#152) |
| تفاصيل الإعلان | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51080) | FED-MOB-1 (#152) |
| تفاصيل الإعلان · محظور | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51100) | FED-MOB-1 (#152) |
| تفاصيل الإعلان · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51120) | FED-MOB-1 (#152) |
| تفاصيل الإعلان · محذوف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51140) | FED-MOB-1 (#152) |
| تفاصيل الإعلان · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51160) | FED-MOB-1 (#152) |
| نشر إعلان | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51364) | FED-MOB-1 (#152) |
| نشر إعلان · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51384) | FED-MOB-1 (#152) |
| نشر إعلان · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51404) | FED-MOB-1 (#152) |
| نشر إعلان · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51424) | FED-MOB-1 (#152) |
| تعديل الإعلان | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51654) | FED-MOB-1 (#152) |
| تعديل الإعلان · جارٍ الحفظ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51674) | FED-MOB-1 (#152) |
| طلب التسجيل كبائع | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51841) | FED-MOB-1 (#152) |
| طلب التسجيل كبائع · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51861) | FED-MOB-1 (#152) |
| طلب التسجيل كبائع · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51881) | FED-MOB-1 (#152) |
| طلب التسجيل كبائع · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51901) | FED-MOB-1 (#152) |
| طلب التسجيل كبائع · قيد المراجعة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51921) | FED-MOB-1 (#152) |
| طلب التسجيل كبائع · مرفوض | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51941) | FED-MOB-1 (#152) |
| طلب التسجيل كبائع · محظور | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-51961) | FED-MOB-1 (#152) |
| إعلاناتي | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52225) | FED-MOB-1 (#152) |
| إعلاناتي · قيد المراجعة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52262) | FED-MOB-1 (#152) |
| إعلاناتي · مرفوض | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52283) | FED-MOB-1 (#152) |
| إعلاناتي · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52304) | FED-MOB-1 (#152) |
| إعلاناتي · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52325) | FED-MOB-1 (#152) |
| إعلاناتي · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52346) | FED-MOB-1 (#152) |
| إعلاناتي · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52367) | FED-MOB-1 (#152) |
| المحادثات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43270) | CHT-MOB-1 (#156) |
| المحادثات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43307) | CHT-MOB-1 (#156) |
| المحادثات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43328) | CHT-MOB-1 (#156) |
| المحادثات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43349) | CHT-MOB-1 (#156) |
| المحادثة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43526) | CHT-MOB-1 (#156) |
| المحادثة · جارٍ الإرسال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43546) | CHT-MOB-1 (#156) |
| المحادثة · فشل الإرسال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43566) | CHT-MOB-1 (#156) |
| المحادثة · محظور | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43586) | CHT-MOB-1 (#156) |
| المحادثة · الإعلان محذوف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43606) | CHT-MOB-1 (#156) |
| المحادثة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43626) | CHT-MOB-1 (#156) |
| المحادثة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43646) | CHT-MOB-1 (#156) |
| المحادثة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43666) | CHT-MOB-1 (#156) |
| قائمة الإبلاغ والحظر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-43965) | CHT-MOB-1 (#156) |
| الإبلاغ عن المحادثة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-44053) | CHT-MOB-1 (#156) |
| الإبلاغ عن المحادثة · محدّدة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-44147) | CHT-MOB-1 (#156) |
| الإبلاغ عن المحادثة · جارٍ الإرسال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-44241) | CHT-MOB-1 (#156) |
| الإبلاغ عن المحادثة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-44337) | CHT-MOB-1 (#156) |
| الإبلاغ عن المحادثة · تم الإرسال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-44435) | CHT-MOB-1 (#156) |
| حظر المستخدم · تأكيد | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-44519) | CHT-MOB-1 (#156) |
| الإبلاغ عن الإعلان | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-44591) | CHT-MOB-1 (#156) |

### الويب · Customer web (8)

| Screen | Figma | Implementing task |
|---|---|---|
| سوق الأعلاف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50623) | FED-WEB-1 (#153) |
| سوق الأعلاف · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50727) | FED-WEB-1 (#153) |
| سوق الأعلاف · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50814) | FED-WEB-1 (#153) |
| سوق الأعلاف · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-50901) | FED-WEB-1 (#153) |
| تفاصيل الإعلان | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52696) | FED-WEB-1 (#153) |
| تفاصيل الإعلان · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52778) | FED-WEB-1 (#153) |
| تفاصيل الإعلان · محذوف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52851) | FED-WEB-1 (#153) |
| تفاصيل الإعلان · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-52924) | FED-WEB-1 (#153) |

### لوحات التحكم · Dashboards (18)

| Screen | Figma | Implementing task |
|---|---|---|
| إشراف الإعلانات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-44649) | FED-DSH-1 (#151) |
| إشراف الإعلانات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-44898) | FED-DSH-1 (#151) |
| إشراف الإعلانات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-45262) | FED-DSH-1 (#151) |
| إشراف الإعلانات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-45536) | FED-DSH-1 (#151) |
| إشراف الإعلانات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-45810) | FED-DSH-1 (#151) |
| إشراف الإعلانات · مفلترة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-46074) | FED-DSH-1 (#151) |
| إشراف الإعلانات · نافذة الحذف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-46407) | FED-DSH-1 (#151) |
| بلاغات المحادثات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-46679) | FED-DSH-1 (#151) |
| بلاغات المحادثات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-46868) | FED-DSH-1 (#151) |
| بلاغات المحادثات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-47150) | FED-DSH-1 (#151) |
| بلاغات المحادثات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-47370) | FED-DSH-1 (#151) |
| بلاغات المحادثات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-47590) | FED-DSH-1 (#151) |
| بلاغات المحادثات · مفلترة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-47800) | FED-DSH-1 (#151) |
| تفاصيل البلاغ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48056) | FED-DSH-1 (#151) |
| تفاصيل البلاغ · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48192) | FED-DSH-1 (#151) |
| تفاصيل البلاغ · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48286) | FED-DSH-1 (#151) |
| تفاصيل البلاغ · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48464) | FED-DSH-1 (#151) |
| تفاصيل البلاغ · نافذة الحظر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-48602) | FED-DSH-1 (#151) |

## [06 البائع](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6638)

### الويب · Customer web (20)

| Screen | Figma | Implementing task |
|---|---|---|
| طلب بائع: بيانات المنشأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-29735) | VND-DSH-1 (#45) |
| طلب بائع: بيانات المنشأة · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-30239) | VND-DSH-1 (#45) |
| طلب بائع: بيانات المنشأة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-30412) | VND-DSH-1 (#45) |
| طلب بائع: بيانات المنشأة · تم الإرسال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-31612) | VND-DSH-1 (#45) |
| طلب بائع: المستندات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-29848) | VND-DSH-1 (#45) |
| طلب بائع: المستندات · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-30585) | VND-DSH-1 (#45) |
| طلب بائع: المستندات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-30784) | VND-DSH-1 (#45) |
| طلب بائع: الحساب البنكي | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-29959) | VND-DSH-1 (#45) |
| طلب بائع: الحساب البنكي · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-30982) | VND-DSH-1 (#45) |
| طلب بائع: الموقع | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-30055) | VND-DSH-1 (#45) |
| طلب بائع: الموقع · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-31139) | VND-DSH-1 (#45) |
| طلب بائع: الصور | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-30154) | VND-DSH-1 (#45) |
| طلب بائع: الصور · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-31302) | VND-DSH-1 (#45) |
| طلب بائع: الصور · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-31456) | VND-DSH-1 (#45) |
| حالة طلب البائع · قيد المراجعة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-31705) | VND-DSH-1 (#45) |
| حالة طلب البائع · مقبول | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-31787) | VND-DSH-1 (#45) |
| حالة طلب البائع · مرفوض | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-31927) | VND-DSH-1 (#45) |
| حالة طلب البائع · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-32063) | VND-DSH-1 (#45) |
| حالة طلب البائع · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-32148) | VND-DSH-1 (#45) |
| حالة طلب البائع · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-32235) | VND-DSH-1 (#45) |

### لوحات التحكم · Dashboards (52)

| Screen | Figma | Implementing task |
|---|---|---|
| ملف المتجر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-24074) | VND-DSH-1 (#45) |
| ملف المتجر · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-24223) | VND-DSH-1 (#45) |
| ملف المتجر · تحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-24427) | VND-DSH-1 (#45) |
| ملف المتجر · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-24631) | VND-DSH-1 (#45) |
| ملف المتجر · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-24717) | VND-DSH-1 (#45) |
| ملف المتجر · غير مسموح · موقوف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-24863) | VND-DSH-1 (#45) |
| منتجاتي | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-25074) | CAT-DSH-2 (#52) |
| منتجاتي · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-25293) | CAT-DSH-2 (#52) |
| منتجاتي · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-25601) | CAT-DSH-2 (#52) |
| منتجاتي · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-25808) | CAT-DSH-2 (#52) |
| منتجاتي · غير مسموح · المتجر قيد المراجعة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-26015) | CAT-DSH-2 (#52) |
| منتجاتي · مفلترة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-26222) | CAT-DSH-2 (#52) |
| نموذج المنتج | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-35405) | CAT-DSH-1 (#51), CAT-DSH-2 (#52) |
| نموذج المنتج · منتج جديد | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-35813) | CAT-DSH-1 (#51), CAT-DSH-2 (#52) |
| نموذج المنتج · تحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-36439) | CAT-DSH-1 (#51), CAT-DSH-2 (#52) |
| نموذج المنتج · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-37119) | CAT-DSH-1 (#51), CAT-DSH-2 (#52) |
| نموذج المنتج · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-37423) | CAT-DSH-1 (#51), CAT-DSH-2 (#52) |
| نموذج المنتج · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-37786) | CAT-DSH-1 (#51), CAT-DSH-2 (#52) |
| ملاحظات الرفض | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-38124) | CAT-DSH-2 (#52) |
| ملاحظات الرفض · أُعيد الإرسال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-38234) | CAT-DSH-2 (#52) |
| ملاحظات الرفض · مقبول | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-38367) | CAT-DSH-2 (#52) |
| ملاحظات الرفض · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-38500) | CAT-DSH-2 (#52) |
| ملاحظات الرفض · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-38579) | CAT-DSH-2 (#52) |
| لوحة الطلبات المباشرة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-39184) | VOP-DSH-1 (#109) |
| لوحة الطلبات المباشرة · تنبيه طلب جديد | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-39379) | VOP-DSH-1 (#109) |
| لوحة الطلبات المباشرة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-39698) | VOP-DSH-1 (#109) |
| لوحة الطلبات المباشرة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-39883) | VOP-DSH-1 (#109) |
| لوحة الطلبات المباشرة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-40098) | VOP-DSH-1 (#109) |
| لوحة الطلبات المباشرة · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-40275) | VOP-DSH-1 (#109) |
| اختيار وقت الذبح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-40487) | VOP-DSH-1 (#109) |
| رفع صور الطزاجة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-41340) | VOP-DSH-1 (#109) |
| اختيار وقت الذبح · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-40707) | VOP-DSH-1 (#109) |
| اختيار وقت الذبح · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-40930) | VOP-DSH-1 (#109) |
| اختيار وقت الذبح · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-41071) | VOP-DSH-1 (#109) |
| رفع صور الطزاجة · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-41554) | VOP-DSH-1 (#109) |
| رفع صور الطزاجة · جارٍ الرفع | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-41771) | VOP-DSH-1 (#109) |
| رفع صور الطزاجة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-41989) | VOP-DSH-1 (#109) |
| ملصق الطلب | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-42187) | VOP-DSH-1 (#109) |
| ملصق الطلب · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-42297) | VOP-DSH-1 (#109) |
| ملصق الطلب · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-42420) | VOP-DSH-1 (#109) |
| ملصق الطلب · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-42579) | VOP-DSH-1 (#109) |
| ملصق الطلب · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-42697) | VOP-DSH-1 (#109) |
| الأرباح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-42817) | FIN-DSH-1 (#118) |
| الأرباح · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-43020) | FIN-DSH-1 (#118) |
| الأرباح · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-43319) | FIN-DSH-1 (#118) |
| الأرباح · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-43500) | FIN-DSH-1 (#118) |
| الأرباح · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-43671) | FIN-DSH-1 (#118) |
| دفعات الأرباح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-43854) | FIN-DSH-1 (#118) |
| دفعات الأرباح · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-44005) | FIN-DSH-1 (#118) |
| دفعات الأرباح · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-44224) | FIN-DSH-1 (#118) |
| دفعات الأرباح · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-44374) | FIN-DSH-1 (#118) |
| دفعات الأرباح · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-44516) | FIN-DSH-1 (#118) |

## [07 الإدارة](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=199-6639)

### لوحات التحكم · Dashboards (142)

| Screen | Figma | Implementing task |
|---|---|---|
| الإعدادات التشغيلية | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-11181) | SCH-DSH-1 (#70) |
| الإعدادات التشغيلية · متوقف مؤقتًا | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-11833) | SCH-DSH-1 (#70) |
| الإعدادات التشغيلية · تأكيد الإيقاف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-12270) | SCH-DSH-1 (#70) |
| الإعدادات التشغيلية · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-12702) | SCH-DSH-1 (#70) |
| الإعدادات التشغيلية · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-12773) | SCH-DSH-1 (#70) |
| الإعدادات التشغيلية · تحقق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-12848) | SCH-DSH-1 (#70) |
| الإعدادات التشغيلية · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=118-13416) | SCH-DSH-1 (#70) |
| المتاجر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-16744) | VND-DSH-2 (#46) |
| المتاجر · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-16992) | VND-DSH-2 (#46) |
| المتاجر · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-17362) | VND-DSH-2 (#46) |
| المتاجر · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-17642) | VND-DSH-2 (#46) |
| المتاجر · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-17922) | VND-DSH-2 (#46) |
| المتاجر · مفلترة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-18192) | VND-DSH-2 (#46) |
| مراجعة المتجر | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-18512) | VND-DSH-2 (#46) |
| مراجعة المتجر · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-18674) | VND-DSH-2 (#46) |
| مراجعة المتجر · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-18781) | VND-DSH-2 (#46) |
| مراجعة المتجر · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-18972) | VND-DSH-2 (#46) |
| مراجعة المتجر · مقبول | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-19123) | VND-DSH-2 (#46) |
| مراجعة المتجر · نافذة القبول | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-19351) | VND-DSH-2 (#46) |
| مراجعة المتجر · نافذة الرفض | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-19527) | VND-DSH-2 (#46) |
| مراجعة المتجر · نافذة الإيقاف | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-19710) | VND-DSH-2 (#46) |
| التصنيفات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-19875) | CAT-DSH-1 (#51) |
| التصنيفات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-20094) | CAT-DSH-1 (#51) |
| التصنيفات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-20356) | CAT-DSH-1 (#51) |
| التصنيفات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-20610) | CAT-DSH-1 (#51) |
| التصنيفات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-20824) | CAT-DSH-1 (#51) |
| التصنيفات · نافذة التعديل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-21038) | CAT-DSH-1 (#51) |
| المنتجات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-21286) | CAT-DSH-1 (#51) |
| المنتجات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-21524) | CAT-DSH-1 (#51) |
| المنتجات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-21874) | CAT-DSH-1 (#51) |
| المنتجات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-22134) | CAT-DSH-1 (#51) |
| المنتجات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-22394) | CAT-DSH-1 (#51) |
| المنتجات · مفلترة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-22654) | CAT-DSH-1 (#51) |
| طابور مراجعة المنتجات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-22954) | CAT-DSH-2 (#52) |
| طابور مراجعة المنتجات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-23123) | CAT-DSH-2 (#52) |
| طابور مراجعة المنتجات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-23351) | CAT-DSH-2 (#52) |
| طابور مراجعة المنتجات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-23527) | CAT-DSH-2 (#52) |
| طابور مراجعة المنتجات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-23693) | CAT-DSH-2 (#52) |
| طابور مراجعة المنتجات · نافذة المراجعة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=131-23859) | CAT-DSH-2 (#52) |
| نظرة عامة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-46622) | ADM-DSH-1 (#113) |
| نظرة عامة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-46807) | ADM-DSH-1 (#113) |
| نظرة عامة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-46966) | ADM-DSH-1 (#113) |
| نظرة عامة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-47170) | ADM-DSH-1 (#113) |
| نظرة عامة · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-47334) | ADM-DSH-1 (#113) |
| الطلبات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-47501) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| الطلبات · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-47767) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| الطلبات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-48111) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| الطلبات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-48353) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| الطلبات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-48640) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| الطلبات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-48887) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| تفاصيل الطلب | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-49134) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| تفاصيل الطلب · إلغاء واسترداد | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-49317) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| تفاصيل الطلب · إعادة جدولة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-49465) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| تفاصيل الطلب · ملصق الطلب | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-49613) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| تفاصيل الطلب · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-49759) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| تفاصيل الطلب · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-49902) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| تفاصيل الطلب · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-50130) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| تفاصيل الطلب · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-50278) | ADM-DSH-2 (#114), ORD-DSH-1 (#88) |
| العملاء | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-50429) | ADM-DSH-2 (#114) |
| العملاء · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-50666) | ADM-DSH-2 (#114) |
| العملاء · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-50967) | ADM-DSH-2 (#114) |
| العملاء · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-51194) | ADM-DSH-2 (#114) |
| العملاء · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-51466) | ADM-DSH-2 (#114) |
| العملاء · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-51698) | ADM-DSH-2 (#114) |
| تفاصيل العميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-51930) | ADM-DSH-2 (#114) |
| تفاصيل العميل · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-52094) | ADM-DSH-2 (#114) |
| تفاصيل العميل · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-52232) | ADM-DSH-2 (#114) |
| تفاصيل العميل · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-52415) | ADM-DSH-2 (#114) |
| تفاصيل العميل · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-52558) | ADM-DSH-2 (#114) |
| طابور الشكاوى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-52705) | CAN-DSH-1 (#93) |
| طابور الشكاوى · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-52918) | CAN-DSH-1 (#93) |
| طابور الشكاوى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-53191) | CAN-DSH-1 (#93) |
| طابور الشكاوى · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-53388) | CAN-DSH-1 (#93) |
| طابور الشكاوى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-53630) | CAN-DSH-1 (#93) |
| طابور الشكاوى · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-53832) | CAN-DSH-1 (#93) |
| تفاصيل الشكوى | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-54034) | CAN-DSH-1 (#93) |
| تفاصيل الشكوى · تم الحل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-54150) | CAN-DSH-1 (#93) |
| تفاصيل الشكوى · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-54294) | CAN-DSH-1 (#93) |
| تفاصيل الشكوى · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-54403) | CAN-DSH-1 (#93) |
| تفاصيل الشكوى · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-54557) | CAN-DSH-1 (#93) |
| تفاصيل الشكوى · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-54671) | CAN-DSH-1 (#93) |
| الشحنات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-54788) | DLV-DSH-1 (#100) |
| الشحنات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-54967) | DLV-DSH-1 (#100) |
| الشحنات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-55116) | DLV-DSH-1 (#100) |
| الشحنات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-55310) | DLV-DSH-1 (#100) |
| الشحنات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-55464) | DLV-DSH-1 (#100) |
| إسناد التوصيل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-55618) | DLV-DSH-1 (#100) |
| إسناد التوصيل · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-55764) | DLV-DSH-1 (#100) |
| إسناد التوصيل · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-55895) | DLV-DSH-1 (#100) |
| إسناد التوصيل · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-56071) | DLV-DSH-1 (#100) |
| إسناد التوصيل · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-56207) | DLV-DSH-1 (#100) |
| التوصيلات المتعثرة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-56343) | DLV-DSH-1 (#100) |
| التوصيلات المتعثرة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-56465) | DLV-DSH-1 (#100) |
| التوصيلات المتعثرة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-56591) | DLV-DSH-1 (#100) |
| التوصيلات المتعثرة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-56762) | DLV-DSH-1 (#100) |
| التوصيلات المتعثرة · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-56893) | DLV-DSH-1 (#100) |
| الدفع عند الاستلام | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-57024) | DLV-DSH-1 (#100) |
| الدفع عند الاستلام · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-57182) | DLV-DSH-1 (#100) |
| الدفع عند الاستلام · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-57320) | DLV-DSH-1 (#100) |
| الدفع عند الاستلام · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-57503) | DLV-DSH-1 (#100) |
| الدفع عند الاستلام · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-57646) | DLV-DSH-1 (#100) |
| الأرصدة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-57793) | FIN-DSH-1 (#118) |
| الأرصدة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-57950) | FIN-DSH-1 (#118) |
| الأرصدة · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-58081) | FIN-DSH-1 (#118) |
| الأرصدة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-58257) | FIN-DSH-1 (#118) |
| الأرصدة · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-58393) | FIN-DSH-1 (#118) |
| الدفعات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-58529) | FIN-DSH-1 (#118) |
| الدفعات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-58665) | FIN-DSH-1 (#118) |
| الدفعات · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-58799) | FIN-DSH-1 (#118) |
| الدفعات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-58978) | FIN-DSH-1 (#118) |
| الدفعات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-59117) | FIN-DSH-1 (#118) |
| التقارير المالية | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-59256) | FIN-DSH-1 (#118) |
| التقارير المالية · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-59360) | FIN-DSH-1 (#118) |
| التقارير المالية · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-59461) | FIN-DSH-1 (#118) |
| التقارير المالية · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-59607) | FIN-DSH-1 (#118) |
| التقارير المالية · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-59713) | FIN-DSH-1 (#118) |
| الموظفون | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-59822) | ADM-DSH-1 (#113) |
| الموظفون · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-59963) | ADM-DSH-1 (#113) |
| الموظفون · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-60100) | ADM-DSH-1 (#113) |
| الموظفون · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-60282) | ADM-DSH-1 (#113) |
| الموظفون · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-60424) | ADM-DSH-1 (#113) |
| مصفوفة الصلاحيات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-60566) | ADM-DSH-1 (#113) |
| مصفوفة الصلاحيات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-60875) | ADM-DSH-1 (#113) |
| مصفوفة الصلاحيات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-61066) | ADM-DSH-1 (#113) |
| مصفوفة الصلاحيات · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-61302) | ADM-DSH-1 (#113) |
| سجل التدقيق | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-61502) | ADM-DSH-1 (#113) |
| سجل التدقيق · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-61660) | ADM-DSH-1 (#113) |
| سجل التدقيق · فارغة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-61822) | ADM-DSH-1 (#113) |
| سجل التدقيق · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-62029) | ADM-DSH-1 (#113) |
| سجل التدقيق · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-62196) | ADM-DSH-1 (#113) |
| مقارنة التغييرات | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-62363) | ADM-DSH-1 (#113) |
| مقارنة التغييرات · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-62472) | ADM-DSH-1 (#113) |
| مقارنة التغييرات · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-62585) | ADM-DSH-1 (#113) |
| إنشاء حملة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-62747) | NOT-DSH-1 (#106) |
| إنشاء حملة · معبّأة | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-62854) | NOT-DSH-1 (#106) |
| إنشاء حملة · تم الإرسال | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=214-30055) | NOT-DSH-1 (#106) |
| إنشاء حملة · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63072) | NOT-DSH-1 (#106) |
| إنشاء حملة · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63162) | NOT-DSH-1 (#106) |
| إنشاء حملة · غير مسموح | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63297) | NOT-DSH-1 (#106) |
| رفض الصلاحية | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63396) | ADM-DSH-1 (#113) |
| رفض الصلاحية · تحميل | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63471) | ADM-DSH-1 (#113) |
| رفض الصلاحية · خطأ | [open](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=135-63543) | ADM-DSH-1 (#113) |
