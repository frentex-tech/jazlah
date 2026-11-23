# نسخة التجربة (staging) على Render: خطوة بخطوة

الدليل ده لصاحب المشروع. امشِ عليه بالترتيب. مش محتاج تعرف برمجة.
كل حاجة هنا على **الخطط المجانية**. مفيش دومين ولا DNS: العناوين بتبقى `….onrender.com`.

## اللي هيتعمل في الآخر

كله في فرانكفورت:

| فين | الاسم | هو إيه |
|---|---|---|
| Render | `jazla-api-staging` | الـAPI (السيرفر) |
| Render | `jazla-dashboard-staging` | لوحة التحكم: الأدمن والتاجر والمطبخ |
| Neon | `jazlah-staging` | قاعدة البيانات (PostgreSQL). **إنت عملتها خلاص.** |
| Upstash | `jazlah-staging` | Redis (لحدود المحاولات). **إنت عملته خلاص.** |

خدمتين Render بتعملهم بإيدك (الخطوة 3). ملف `render.yaml` مرجع للقيم بس.

**روابط الدخول** (`DASH` = `https://jazla-dashboard-staging.onrender.com`):

| مين | الرابط |
|---|---|
| الأدمن | `DASH/login` |
| التاجر | `DASH/login?panel=vendor` |
| المطبخ | `DASH/login?panel=kitchen` |

من غير `?panel=` الصفحة بتفتح على لوحة الأدمن.

كل دمج في فرع `develop` بينزل لوحده على Render، بعد ما الـCI يبقى أخضر.

**حدود الخطة المجانية (مهم تعرفها):**
- **السيرفر بينام** بعد 15 دقيقة من غير استخدام. أول فتحة بعدها بتاخد حوالي دقيقة. ده طبيعي.
- **قاعدة البيانات (Neon) مش بتنتهي**، بس بتنام بعد 5 دقايق من غير استخدام، وبتصحى في ثواني. حدّها 1 جيجا و100 «CU-hour» في الشهر (حوالي 400 ساعة تشغيل بأصغر حجم). لو الساعات خلصت، بتقف لأول الشهر.
- **Redis (Upstash) حدّه 500 ألف أمر في الشهر.** عشان كده الشغل اللي في الخلفية (الطوابير) **مقفول** على التجربة: لو اشتغل، لوحده هيخلّص الحد في أقل من أسبوع. حدود المحاولات شغالة عادي. لو الحد خلص، الـAPI ممكن يرجّع أخطاء لحد أول الشهر. متابعة الاستهلاك في الخطوة 8.
- مفيش نسخ احتياطي للبيانات. دي نسخة تجربة، متحطش فيها بيانات حقيقية.
- **رفع الصور والملفات متوقف** لحد ما تعمل حساب AWS (الخطوة 7). باقي كل حاجة شغالة. أي محاولة رفع بترجع رسالة إن الخدمة متوقفة، والصور التجريبية بتظهر مكسورة.
- **750 ساعة تشغيل مجانية في الشهر** للحساب كله، والـAPI والداشبورد بيتقاسموها. لو الخدمات وقفت في نص الشهر، يبقى الساعات خلصت، وبترجع أول الشهر.
- **دقايق البناء محدودة.** لو خلصت، Render بيوقف أي بناء جديد لأول الشهر: الموجود يفضل شغال، بس الدمج الجديد مش بينزل. الحل: ترفع الحد من **Billing**، أو تستنى أول الشهر.
- **مفيش رسائل SMS.** رمز الدخول بيتكتب في الـLogs، أو بتدخل بحسابات المراجعة (الخطوة 2).

---

## الخطوة 1: حساب Render

1. ادخل [dashboard.render.com](https://dashboard.render.com) واعمل حساب. الأسهل تدخل بحساب GitHub.
2. اسمح لـRender يوصل للريبو `frentex-tech/jazlah`. لو طلب صلاحية من منظمة frentex-tech، وافق.
3. **Render بيطلب كارت دفع حتى للخدمات المجانية.** ضيفه، وخلّي الخدمتين على **Free**: مش هيتسحب فلوس طول ما هم Free.

## الخطوة 2: اختار رموز حسابات المراجعة

حسابات المراجعة بتدخل برمز ثابت إنت بتختاره، من غير SMS. الأرقام دي أرقام تجريبية موجودة في البيانات اللي بتتعبّى لوحدها:

| الحساب | الرقم | بيفتح |
|---|---|---|
| أدمن | `0500000004` | لوحة الأدمن |
| تاجر | `0500000002` | لوحة التاجر (ملحمة النخبة) |
| مطبخ | `0500000003` | لوحة المطبخ |
| كل اللوحات | `0500000006` | الأدمن والتاجر والمطبخ |
| عميل | `0500000001` | التطبيق (لو عايز تجرّب الموبايل) |

1. اختار **رمز من 6 أرقام لكل حساب**. خلّي كل رمز مختلف، ومتستخدمش رموز سهلة زي `123456` أو `444444`: العنوان مفتوح على الإنترنت.
2. اكتب السطر ده بالرموز بتاعتك (من غير مسافات)، واحفظه في مدير الباسووردات عندك:

   ```
   +966500000004:الرمز,+966500000002:الرمز,+966500000003:الرمز,+966500000006:الرمز,+966500000001:الرمز
   ```

   بدّل كلمة «الرمز» بالرمز اللي اخترته لكل رقم. **متبعتش الرموز لحد في شات.**

## الخطوة 3: اعمل الخدمتين بإيدك (من غير Blueprint)

**الخدمتين اتعملوا بالإيد** من **New ← Web Service**، والقاعدة والـRedis على Neon وUpstash. ملف `render.yaml` في الريبو **مرجع للقيم بس**، ومش بيتطبّق على Render لوحده.

**قبل ما تبدأ، جهّز 3 مفاتيح عشوائية.** هتحطهم في الـAPI. افتح Terminal على جهازك، واكتب الأمر ده **3 مرات**، وكل مرة انسخ الناتج في مدير الباسووردات (كل مرة بيطلع مفتاح مختلف، ولازم يكونوا مختلفين):

```
openssl rand -base64 32
```

الناتج 44 حرف وآخره `=`. **متستخدمش زرار Generate في Render:** بيطلّع 32 حرف، وده مش مفتاح صالح لـ`VENDORS_IBAN_KEY`، والـAPI هيرفض يشتغل. سمّيهم في مدير الباسووردات: **مفتاح 1** و**مفتاح 2** و**مفتاح 3**.

**علامة 🔒 في الجداول تحت يعني سر.** الصقه في Render بس، ومتبعتهوش لحد، ومتصوّرش الصفحة اللي هو فيها. عندك **6 أسرار**، كلهم في الـAPI. **3 بتجيبهم** من Neon وUpstash والخطوة 2:
- 🔒 `DATABASE_URL`
- 🔒 `REDIS_URL`
- 🔒 `AUTH_REVIEW_ACCOUNTS`

و**3 مفاتيح** من الـTerminal (مفتاح 1 و2 و3)، بتلصقهم زي ما هم.

### 3.1 الـAPI: `jazla-api-staging`

في Render اضغط **New** (فوق) ← **Web Service** ← اختار الريبو `frentex-tech/jazlah`. وبعدين املأ الحقول دي بالظبط:

| الحقل في Render | القيمة |
|---|---|
| **Name** | `jazla-api-staging` |
| **Language** | `Docker` |
| **Branch** | `develop` |
| **Region** | `Frankfurt (EU Central)` |
| **Root Directory** | `services/api` |
| **Dockerfile Path** | `./Dockerfile` (لو مش ظاهر فوق، هتلاقيه في **Advanced**) |
| **Docker Build Context Directory** | `.` |
| **Instance Type** | **Free** |

**Dockerfile Path** و**Docker Build Context Directory** بيتحسبوا من جوه الـRoot Directory. فاكتب `./Dockerfile` و`.` بس، من غير `services/api/`.

بعدين انزل لـ**Environment Variables** ← **Add Environment Variable**، وضيف ده كله:

| الاسم | القيمة | مين بيدخلها |
|---|---|---|
| `NODE_ENV` | `production` | انسخها زي ما هي |
| `DEPLOYMENT_ENV` | `staging` | انسخها زي ما هي |
| `LOG_LEVEL` | `info` | انسخها زي ما هي |
| `TRUST_PROXY_HOPS` | `1` | انسخها زي ما هي |
| `QUEUE_WORKERS_ENABLED` | `false` | انسخها زي ما هي |
| `API_DOCS_ENABLED` | `true` | انسخها زي ما هي |
| `SEED_ON_START` | `true` | انسخها زي ما هي |
| `DATABASE_URL` | 🔒 من Neon: افتح المشروع `jazlah-staging` ← **Connect** ← **اقفل Connection pooling** ← انسخ العنوان. لازم يبدأ بـ`postgresql://`، ومفيهوش كلمة `-pooler`، وآخره `sslmode=require`. زوّد في آخره `&connect_timeout=15` (عشان القاعدة لو نايمة تلحق تصحى). | **إنت** |
| `DATABASE_CONNECTION_TIMEOUT_MS` | `15000` | انسخها زي ما هي |
| `REDIS_URL` | 🔒 من Upstash: افتح `jazlah-staging` ← **Connect** ← انسخ العنوان اللي بيبدأ بـ`rediss://` (بـ`s` زيادة، يعني مشفّر). | **إنت** |
| `REDIS_KEY_PREFIX` | `jazla-staging` | انسخها زي ما هي |
| `STORAGE_PROVIDER` | `disabled` | انسخها زي ما هي (بتتغيّر في الخطوة 7.5) |
| `SMS_PROVIDERS` | `log` | انسخها زي ما هي |
| `AUTH_ACCESS_TOKEN_SECRET` | 🔒 **مفتاح 1** | **إنت** (من الـTerminal) |
| `AUTH_ACCESS_TOKEN_KEY_ID` | `staging-1` | انسخها زي ما هي |
| `AUTH_OTP_SECRET` | 🔒 **مفتاح 2** (لازم يختلف عن مفتاح 1) | **إنت** (من الـTerminal) |
| `AUTH_REVIEW_ACCOUNTS` | 🔒 السطر من الخطوة 2 | **إنت** |
| `VENDORS_IBAN_KEY` | 🔒 **مفتاح 3** | **إنت** (من الـTerminal) |
| `VENDORS_IBAN_KEY_ID` | `staging-1` | انسخها زي ما هي |
| `CORS_ORIGINS` | **متضيفهاش دلوقتي.** بتتضاف في الخطوة 4 | **إنت**، بعدين |

**مهم:** متغيّرش `VENDORS_IBAN_KEY` ولا `AUTH_OTP_SECRET` بعد أول تشغيل. لو اتغيّروا، بيانات التجار المشفّرة ورموز الدخول القديمة مش هتتقري.

بعدين افتح **Advanced**:

| الحقل في Render | القيمة |
|---|---|
| **Health Check Path** | `/v1/health` |
| **Pre-Deploy Command** | **سيبه فاضي**: مش متاح على Free |
| **Docker Command** | `sh scripts/render-start.sh` |
| **Auto-Deploy** | `After CI Checks Pass` |

**مهم:** خانة **Docker Command** في Render بتسيب علامات التنصيص (`'` و`"`) زي ما هي، فأمر زي `sh -c '...'` بيقع بـ`not found`. **اكتب السطر ده زي ما هو بالظبط، من غير أي علامات تنصيص.** السكريبت نفسه موجود جوه الـimage (`services/api/scripts/render-start.sh`).

السكريبت ده بيعمل 3 حاجات بالترتيب: يعمل الجداول (migrations)، وبعدين يعبّي البيانات التجريبية (seed)، وبعدين يشغّل الـAPI. لو الجداول فشلت، الـAPI مش بيشتغل، وRender بيسيب النسخة القديمة شغالة. ولو التعبئة فشلت، الـAPI بيشتغل عادي.

اضغط **Deploy Web Service** (أو **Create Web Service**). أول مرة بتاخد من 5 لـ15 دقيقة.

**لو الخدمة معمولة خلاص بأمر تاني** (زي `node dist/main`): افتح `jazla-api-staging` ← **Settings** ← **Docker Command** ← **Edit** ← اكتب `sh scripts/render-start.sh` ← **Save Changes**. وبعدين **Manual Deploy** ← **Deploy latest commit**. في الـLogs المفروض تشوف الـmigrations، وبعدها سطر الـseed، وبعدها تشغيل الـAPI.

كل مرة السيرفر بيصحى من النوم، السكريبت بيعيد الـmigrations والـseed. ده بيزوّد وقت الصحيان شوية، وده متوقع.

### 3.2 الداشبورد: `jazla-dashboard-staging`

**New** ← **Web Service** ← نفس الريبو:

| الحقل في Render | القيمة |
|---|---|
| **Name** | `jazla-dashboard-staging` |
| **Language** | `Node` |
| **Branch** | `develop` |
| **Region** | `Frankfurt (EU Central)` |
| **Root Directory** | `apps/dashboard` |
| **Build Command** | `sh scripts/deploy-guard.sh && pnpm install --frozen-lockfile && pnpm build` |
| **Start Command** | `sh scripts/deploy-guard.sh && pnpm exec next start -p $PORT` |
| **Instance Type** | **Free** |

`deploy-guard.sh` اللي في أول الأمرين ده **الحارس**: بيوقّف البناء والتشغيل لو حد حط إعدادات التجربة الوهمية. متشيلهوش.

**Environment Variables** (ولا واحدة فيهم سر):

| الاسم | القيمة | مين بيدخلها |
|---|---|---|
| `NODE_VERSION` | `24` | انسخها زي ما هي |
| `NEXT_TELEMETRY_DISABLED` | `1` | انسخها زي ما هي |
| `OTP_LENGTH` | `6` | انسخها زي ما هي |
| `CLIENT_IP_HEADER` | `x-forwarded-for` | انسخها زي ما هي |
| `NEXT_PUBLIC_MAP_TILES` | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | انسخها زي ما هي |
| `MEDIA_ORIGINS` | `https://storage-disabled.invalid` | انسخها زي ما هي (بتتغيّر في الخطوة 7.5) |
| `API_URL` | **متضيفهاش دلوقتي.** بتتضاف في الخطوة 4 | **إنت**، بعدين |

**ممنوع تضيف** `DASHBOARD_TEST_BUILD` ولا `DASHBOARD_API_MOCK`.

**Advanced** ← **Auto-Deploy**: `After CI Checks Pass`. سيب **Health Check Path** فاضي.

اضغط **Deploy Web Service** (أو **Create Web Service**).

## الخطوة 4: اربط العنوانين ببعض

بعد ما الاتنين يبقوا **Live** (أخضر):

1. عنوان الـAPI: `https://jazla-api-staging.onrender.com`.
2. افتح `jazla-dashboard-staging` ← **Environment** ← **Add Environment Variable**. الاسم `API_URL`، والقيمة عنوان الـAPI **من غير `/` في الآخر** ← **Save Changes**.
3. عنوان الداشبورد: `https://jazla-dashboard-staging.onrender.com`.
4. افتح `jazla-api-staging` ← **Environment** ← **Add Environment Variable**. الاسم `CORS_ORIGINS`، والقيمة عنوان الداشبورد من غير `/` في الآخر ← **Save Changes**.
5. كل خدمة هتعيد تشغيل نفسها لوحدها (دقيقتين تقريبًا).
6. العنوانين دول متسجّلين خلاص في `docs/frontend/README.md` وإعدادات الموبايل.

## الخطوة 5: اتأكد إن كل حاجة شغالة

بدّل `API` بعنوان الـAPI و`DASH` بعنوان الداشبورد. لو أول فتحة اتأخرت دقيقة، ده السيرفر بيصحى.

1. افتح `API/v1/health`، المفروض تشوف `{"status":"ok"}`.
2. افتح `API/v1/health/ready`، المفروض الـdatabase والـredis الاتنين `ok`.
3. افتح `API/docs`، المفروض تظهر صفحة توثيق الـAPI.
4. افتح `DASH`، المفروض تظهر صفحة الدخول.
5. ادخل بحساب **الأدمن** (`0500000004` والرمز بتاعك). المفروض تدخل لوحة الأدمن وتشوف طلبات التجار والمنتجات التجريبية.
6. اعمل خروج، وجرّب **التاجر** (`0500000002`) من `DASH/login?panel=vendor`، و**المطبخ** (`0500000003`) من `DASH/login?panel=kitchen`.
7. ادخل بحساب **كل اللوحات** (`0500000006`) في الأدمن، وبعدين من `DASH/login?panel=vendor` بنفس الرقم. بعد الدخول التاني المفروض صفحة اختيار اللوحة تظهر.
8. جرّب ترفع صورة. المفروض تظهر رسالة إن الخدمة متوقفة. ده متوقع لحد الخطوة 7.

لو حاجة فشلت: افتح الخدمة ← **Logs**، وابعت للفريق صورة من آخر سطور حمرا. **متبعتش صفحة Environment.**

## الخطوة 6: للفريق (مش للمالك)، أول تشغيل

- **عنوان العميل:** في Logs بتاع الـAPI، دوّر على طلب عملته إنت **مباشرة** (من المتصفح على `API/docs` أو من الموبايل) وشوف `req.ip`. لازم يبقى الـIP العام بتاعك. لو طلع عنوان داخلي لـRender، ارفع `TRUST_PROXY_HOPS` واحد. طلبات الداشبورد هتظهر بالـIP الخارجي للداشبورد نفسه: ده متوقع على الخطة المجانية (مفيش شبكة داخلية)، يعني كل الموظفين بيتحسبوا كعنوان واحد في حدود المحاولات. **متغيّرش `TRUST_PROXY_HOPS` عشانها.**
- **سطر `SECURITY WARNING` من pg** وقت التشغيل عن `sslmode=require`: متوقع، والاتصال مشفّر.
- **رمز دخول لرقم مش حساب مراجعة:** في Logs دوّر على `SMS written to the log instead of sent`. السطر فيه الرقم (`to`) والرسالة بالرمز (`text`).
- **الموبايل:** `apps/mobile/config/staging.json` (مش بيتحفظ في git)، و`API_BASE_URL` = عنوان الـAPI من غير `/v1`. التفاصيل في `apps/mobile/config/README.md`.
- **التعبئة مع كل تشغيل:** طول ما `SEED_ON_START=true`، الـseed بيشتغل مع كل صحيان للسيرفر: بيزوّد الصحيان شوية، وبيرجّع تفعيل أدمن التطوير لو حد وقّفه، وبيطبع في الـLogs سطر رموز التطوير الثابتة (`111111`…`666666`) مع «Add this line to .env». ده كله متوقع، والرموز الحقيقية هي اللي في `AUTH_REVIEW_ACCOUNTS`.
- **إيقاف التعبئة التلقائية:** `SEED_ON_START=false` في Environment بتاع الـAPI. بس سيبها `true` عشان لو القاعدة اتفضّت تتعبّى لوحدها.
- **الطوابير مقفولة** (`QUEUE_WORKERS_ENABLED=false`): مفيش أي job بيشتغل على التجربة، ولا تنظيف الرفعات اللي متأكدتش. متفتحهاش على Upstash المجاني (الحساب في `services/api/.claude/DECISIONS.md`، «Staging database and Redis outside Render»).

## الخطوة 7: التخزين على AWS S3 (لما تعمل الحساب)

ده اللي بيشغّل رفع الصور. **حساب AWS إنت اللي بتعمله بنفسك.** الفريق مش بيفتح حسابات ولا بيشوف باسووردات.

اختار المنطقة **Europe (Frankfurt) `eu-central-1`** من فوق في الكونسول قبل أي حاجة. هتعمل باكتين، وتضيف لآخر اسمهم كلمة من عندك (مثلًا السنة):
- `jazla-staging-public-<كلمتك>`: صور المنتجات والشعارات، أي حد يقدر يفتحها.
- `jazla-staging-private-<كلمتك>`: مستندات طلبات التجار، مقفولة.

### 7.1 الباكت الخاص
**S3** ← **Create bucket**. اكتب الاسم الخاص، والمنطقة `eu-central-1`. سيب **Block all public access** متعلّم عليه. **Create bucket**.

### 7.2 الباكت العام
1. **Create bucket** بالاسم العام. في **Block Public Access** شيل العلامة من **Block all public access**، وبعدين علّم على أول اختيارين بتوع **ACLs** تاني. سيب اختيارين الـ**policies** من غير علامة. وافق على التحذير ← **Create bucket**.
2. افتح الباكت ← **Permissions** ← **Bucket policy** ← **Edit**. الصق ده بعد ما تحط اسم الباكت ← **Save**:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadOfObjectsOnly",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::jazla-staging-public-<كلمتك>/*"
       }
     ]
   }
   ```

### 7.3 الـCORS على الباكتين
في **كل** باكت: **Permissions** ← **Cross-origin resource sharing (CORS)** ← **Edit**. الصق ده بعد ما تحط عنوان الداشبورد من الخطوة 4:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["POST", "GET", "HEAD"],
    "AllowedOrigins": ["https://jazla-dashboard-staging.onrender.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 7.4 مستخدم بمفتاح للباكتين بس
1. **IAM** ← **Users** ← **Create user**. الاسم `jazla-staging-api`، **من غير** دخول للكونسول ← **Next**.
2. **Attach policies directly** ← **Create policy** ← **JSON**. الصق ده بالاسمين ← سمّيها `jazla-staging-storage` ← **Create policy**. ارجع للمستخدم، اعمل refresh، علّم عليها ← **Create user**.

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "ObjectsOfTheTwoBuckets",
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:GetObjectAnnotation", "s3:PutObjectAnnotation"],
         "Resource": ["arn:aws:s3:::jazla-staging-public-<كلمتك>/*", "arn:aws:s3:::jazla-staging-private-<كلمتك>/*"]
       },
       {
         "Sid": "MissingFilesAnswerNotFound",
         "Effect": "Allow",
         "Action": "s3:ListBucket",
         "Resource": ["arn:aws:s3:::jazla-staging-public-<كلمتك>", "arn:aws:s3:::jazla-staging-private-<كلمتك>"]
       }
     ]
   }
   ```
3. افتح المستخدم ← **Security credentials** ← **Create access key** ← **Application running outside AWS**. **انسخ الـAccess key ID والـSecret access key دلوقتي**، لأن الـSecret بيظهر مرة واحدة بس. احفظهم في مدير الباسووردات.

### 7.5 حط القيم في Render
افتح `jazla-api-staging` ← **Environment** ← **Add Environment Variable**، وضيف الـ7 دول ← **Save Changes**:

| الاسم | القيمة |
|---|---|
| `STORAGE_REGION` | `eu-central-1` |
| `STORAGE_ENDPOINT` | `https://s3.eu-central-1.amazonaws.com` |
| `STORAGE_PUBLIC_BUCKET` | اسم الباكت العام |
| `STORAGE_PRIVATE_BUCKET` | اسم الباكت الخاص |
| `STORAGE_PUBLIC_BASE_URL` | `https://<اسم الباكت العام>.s3.eu-central-1.amazonaws.com` |
| `STORAGE_ACCESS_KEY_ID` | الـAccess key ID |
| `STORAGE_SECRET_ACCESS_KEY` | الـSecret access key |

وفي نفس الصفحة غيّر `STORAGE_PROVIDER` من `disabled` لـ`s3` ← **Save Changes**. **متغيّرهاش تاني لـ`disabled`.**

وبعدين افتح `jazla-dashboard-staging` ← **Environment** ← `MEDIA_ORIGINS` ← **Edit**. حط `https://<اسم الباكت العام>.s3.eu-central-1.amazonaws.com` (من غير `/` في الآخر) ← اختار **Save, rebuild, and deploy** (لازم rebuild، لأن القيمة دي بتتحفظ وقت البناء).

أول ما الاتنين يشتغلوا، الرفع يشتغل، والصور التجريبية تترفع لوحدها مع أول تشغيل للـAPI. **ابعت للفريق اسم الباكت العام بس** (مش المفاتيح)، علشان يحدّثوا `render.yaml` كمرجع.

## الخطوة 8: تابع الاستهلاك (مرة في الأسبوع)

- **Upstash:** افتح `jazlah-staging` ← **Usage**. لو عدد الأوامر في الشهر قرّب من 400 ألف، قول للفريق.
- **Neon:** افتح `jazlah-staging` ← **Monitoring** أو صفحة **Usage**. لو الـCU-hours قرّبت من 80، قول للفريق.
- **Upstash بيأرشف القاعدة المجانية** لو فضلت 30 يوم من غير استخدام. لو حصل، ادخل Upstash واعمل **Restore**، وأعد تشغيل `jazla-api-staging` (**Manual Deploy**).
- **في Upstash سيب Eviction مقفول** (ده الافتراضي). لو اتفتح، Redis ممكن يمسح بيانات لوحده.

## الرجوع لنسخة قديمة (Rollback)

لو دمج جديد بوّظ حاجة على التجربة:

1. افتح الخدمة ← **Events** (أو **Deploys**) ← اختار آخر نسخة كانت شغالة ← **Rollback** ← **Rollback to this deploy**. بياخد دقيقة تقريبًا.
2. **مهم: Render بيقفل الـAuto-Deploy لوحده بعد أي Rollback.** من غير الخطوة دي، ولا دمج بعد كده هينزل. افتح **Settings** ← **Auto-Deploy** ← اختار **After CI Checks Pass** ← **Save Changes**.
3. لما الإصلاح يندمج، هينزل لوحده. أو من **Manual Deploy** ← **Deploy latest commit**.

الـRollback بيرجّع الكود بس، مش قاعدة البيانات. لو النسخة الجديدة كان فيها migration، القاعدة بتفضل على الجديد، فقول للفريق قبل ما ترجع.

---

## ممنوع
- متغيّرش أي دومين ولا DNS، ومتضيفش **Custom Domain** في Render. ده قرار لبعدين.
- متحطش رموز ولا مفاتيح في شات أو إيميل أو GitHub.
- متضيفش `DASHBOARD_TEST_BUILD` ولا `DASHBOARD_API_MOCK` للداشبورد. البناء هيرفض يكمل لو لقاهم.
