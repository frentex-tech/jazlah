# نسخة التجربة (staging) على Render: خطوة بخطوة

الدليل ده لصاحب المشروع. امشِ عليه بالترتيب. مش محتاج تعرف برمجة.
كل حاجة هنا على **الخطط المجانية**. مفيش دومين ولا DNS: العناوين بتبقى `….onrender.com`.

## اللي هيتعمل في الآخر

على Render (فرانكفورت)، من ملف `render.yaml` اللي في الريبو:

| الاسم في Render | هو إيه |
|---|---|
| `jazla-api-staging` | الـAPI (السيرفر) |
| `jazla-dashboard-staging` | لوحة التحكم: الأدمن والتاجر والمطبخ |
| `jazla-db-staging` | قاعدة البيانات (PostgreSQL) |
| `jazla-redis-staging` | Redis (للطوابير وحدود المحاولات) |

كل دمج في فرع `develop` بينزل لوحده على Render، بس بعد ما الـCI يبقى أخضر.

**حدود الخطة المجانية (مهم تعرفها):**
- **السيرفر بينام** بعد 15 دقيقة من غير استخدام. أول فتحة بعدها بتاخد حوالي دقيقة. ده طبيعي.
- **قاعدة البيانات المجانية بتنتهي بعد 30 يوم** من إنشائها. بعدها عندك 14 يوم ترقّيها لخطة مدفوعة، وإلا Render بيمسحها. إزاي تجدّدها في الخطوة 8.
- مفيش نسخ احتياطي للبيانات. دي نسخة تجربة، متحطش فيها بيانات حقيقية.
- **رفع الصور والملفات متوقف** لحد ما تعمل حساب AWS (الخطوة 7). باقي كل حاجة شغالة. أي محاولة رفع بترجع رسالة إن الخدمة متوقفة، والصور التجريبية بتظهر مكسورة.
- **مفيش رسائل SMS.** رمز الدخول بيتكتب في الـLogs، أو بتدخل بحسابات المراجعة (الخطوة 2).

---

## الخطوة 1: حساب Render

1. ادخل [dashboard.render.com](https://dashboard.render.com) واعمل حساب. الأسهل تدخل بحساب GitHub.
2. اسمح لـRender يوصل للريبو `frentex-tech/jazlah`. لو طلب صلاحية من منظمة frentex-tech، وافق.
3. مش محتاج تحط كارت دفع للخطط المجانية.

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

## الخطوة 3: إنشاء كل حاجة من الـBlueprint

1. في Render اضغط **New** (فوق)، وبعدين **Blueprint**.
2. اختار الريبو `frentex-tech/jazlah`، والفرع `develop`. Render هيلاقي `render.yaml` لوحده.
3. هيعرض 4 حاجات: `jazla-api-staging` و`jazla-dashboard-staging` و`jazla-redis-staging` و`jazla-db-staging`. كلهم **Free**.
4. هيسألك عن 3 قيم:

   | القيمة | تحط إيه |
   |---|---|
   | `AUTH_REVIEW_ACCOUNTS` | السطر من الخطوة 2 |
   | `CORS_ORIGINS` | **سيبها فاضية دلوقتي** (الخطوة 4) |
   | `API_URL` | **سيبها فاضية دلوقتي** (الخطوة 4) |

   الأسرار التانية (مفاتيح الدخول والتشفير) Render بيعملها لوحده. إنت مش محتاج تعمل أي باسوورد.
5. اضغط **Apply** (أو **Deploy Blueprint**). أول مرة بتاخد من 5 لـ15 دقيقة. الـAPI بيعمل الجداول ويعبّي البيانات التجريبية لوحده.

## الخطوة 4: اربط العنوانين ببعض

بعد ما الاتنين يبقوا **Live** (أخضر):

1. افتح `jazla-api-staging`. هتلاقي عنوانه فوق تحت الاسم، شكله `https://jazla-api-staging-xxxx.onrender.com`. انسخه.
2. افتح `jazla-dashboard-staging` ← **Environment** ← `API_URL` ← **Edit**. الصق عنوان الـAPI **من غير `/` في الآخر** ← **Save Changes**.
3. انسخ عنوان الداشبورد (شكله `https://jazla-dashboard-staging-xxxx.onrender.com`).
4. افتح `jazla-api-staging` ← **Environment** ← `CORS_ORIGINS` ← **Edit**. الصق عنوان الداشبورد، من غير `/` في الآخر ← **Save Changes**.
5. كل خدمة هتعيد تشغيل نفسها لوحدها (دقيقتين تقريبًا).
6. **ابعت العنوانين للفريق** (مش سر). هيحطوهم في `docs/frontend/README.md` وفي إعدادات الموبايل.

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

- **عنوان العميل:** في Logs بتاع الـAPI، دوّر على طلب عملته إنت وشوف `req.ip`. لازم يبقى الـIP العام بتاعك. لو طلع عنوان داخلي لـRender، ارفع `TRUST_PROXY_HOPS` واحد. نفس الفحص لـ`CLIENT_IP_HEADER` في الداشبورد: دخول الموظفين بيتحسب على الـIP ده.
- **رمز دخول لرقم مش حساب مراجعة:** في Logs دوّر على `SMS written to the log instead of sent`. السطر فيه الرقم (`to`) والرسالة بالرمز (`text`).
- **الموبايل:** `apps/mobile/config/staging.json` (مش بيتحفظ في git)، و`API_BASE_URL` = عنوان الـAPI من غير `/v1`. التفاصيل في `apps/mobile/config/README.md`.
- **إيقاف التعبئة التلقائية:** `SEED_ON_START=false` في Environment بتاع الـAPI. بس سيبها `true` عشان القاعدة الجديدة تتعبّى لوحدها بعد التجديد (الخطوة 8).

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
    "AllowedOrigins": ["https://jazla-dashboard-staging-xxxx.onrender.com"],
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

بعدين **ابعت للفريق اسم الباكت العام بس** (مش المفاتيح). الفريق هيعمل PR يغيّر `STORAGE_PROVIDER` لـ`s3` و`MEDIA_ORIGINS` في `render.yaml`. أول ما يندمج، الرفع يشتغل والصور التجريبية تترفع لوحدها مع أول تشغيل.

## الخطوة 8: تجديد قاعدة البيانات كل 30 يوم

Render هيبعتلك إيميل قبل ما القاعدة المجانية تنتهي. عشان تبدأ بقاعدة جديدة فاضية:

1. افتح `jazla-db-staging` ← **Settings** ← **Delete Database**. **ده بيمسح كل بيانات التجربة.**
2. افتح الـBlueprint ← **Manual Sync**. Render هيعمل قاعدة جديدة بنفس الاسم.
3. افتح `jazla-api-staging` ← **Manual Deploy** ← **Deploy latest commit**. الجداول والبيانات التجريبية هتتعمل لوحدها.

لو عايز تحافظ على البيانات، رقّي القاعدة لخطة مدفوعة بدل كده (**Upgrade**).

---

## ممنوع
- متغيّرش أي دومين ولا DNS، ومتضيفش **Custom Domain** في Render. ده قرار لبعدين.
- متحطش رموز ولا مفاتيح في شات أو إيميل أو GitHub.
- متضيفش `DASHBOARD_TEST_BUILD` ولا `DASHBOARD_API_MOCK` للداشبورد. البناء هيرفض يكمل لو لقاهم.
