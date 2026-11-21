# Staging on Render: step by step

This guide sets up the **staging** environment of the JAZLA API from nothing. Follow it in order. It assumes you have never deployed this API before.

When you are done, staging consists of:
- **On Render, in Frankfurt:**
  - the API, a Docker web service built from `services/api/Dockerfile`, which deploys from the `develop` branch whenever API CI passes;
  - PostgreSQL 17, which has the PostGIS and pg_trgm extensions the migrations need;
  - Key Value, Render's Redis, used for rate limits and queues.
- **On AWS S3, in Frankfurt (`eu-central-1`):** two buckets for files, one public and one private.

`render.yaml` at the repository root describes the Render part. You create the AWS part by hand.

**What staging is:** production rules, with one exception. Sign-in codes are **written to the log instead of sent by SMS** (`SMS_PROVIDERS=log`), because the SMS provider is not connected yet. `DEPLOYMENT_ENV=staging` is what allows this, and a real production deployment refuses it. Every secret is required, as in production.

**Costs:** the plans in `render.yaml` are Render's smallest paid ones:
- the web service on `0.5c-512mb`;
- Postgres on `0.1c-256mb`;
- Key Value on `256mb`.

Free plans don't fit: a free web service sleeps when idle, which breaks testing from a phone. S3 is billed by storage and requests, which stays small for staging. Check both price pages before you start.

---

## 1. AWS S3: two buckets, CORS, and an access key

You need an AWS account, signed in to the console as an administrator. All of the following happens in **Europe (Frankfurt) `eu-central-1`**. Pick the region in the console's top bar before creating anything.

Bucket names are global across all of AWS, so add something of your own. This guide uses:
- `jazla-staging-public-<suffix>`: product images, logos, cover photos and category images, readable by anyone at a stable URL;
- `jazla-staging-private-<suffix>`: vendor application documents, readable only through short-lived links from the API.

Replace `<suffix>` with a word of your own (for example the year: `2026`). Write both names down.

### 1.1 The private bucket

1. Open **S3**, then choose **Create bucket**.
2. **Bucket type:** General purpose. **Name:** `jazla-staging-private-<suffix>`. **Region:** `eu-central-1`.
3. **Object Ownership:** leave **ACLs disabled (recommended)**.
4. **Block Public Access settings for this bucket:** leave **Block *all* public access** ticked. This bucket is never public.
5. Leave the other options at their defaults, then choose **Create bucket**.

### 1.2 The public bucket

1. **Create bucket** again. **Name:** `jazla-staging-public-<suffix>`. **Region:** `eu-central-1`. **ACLs disabled.**
2. **Block Public Access settings:** untick **Block *all* public access**, then tick the two ACL settings again. The settings work like this:
   - **Block public access granted through new ACLs:** on.
   - **Block public access granted through any ACLs:** on.
   - **Block public access granted through new public bucket or access point policies:** off.
   - **Block public and cross-account access through any public bucket or access point policies:** off.

   Turn off only the two *policy* settings, because the bucket policy in step 4 is what makes files readable. ACLs stay blocked.
3. Tick the acknowledgement, then choose **Create bucket**.
4. Open the bucket, go to **Permissions**, find **Bucket policy**, and choose **Edit**. Paste the following, with your bucket name:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadOfObjectsOnly",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::jazla-staging-public-<suffix>/*"
       }
     ]
   }
   ```

   This allows anyone to **read a file whose address they know**, and nothing else: there is no listing, because `s3:ListBucket` is not granted to the public. Save.

   If saving fails with "access denied" about public policies, your **account** blocks public policies too. Open **S3 → Block Public Access settings for this account**, check the same two *policy* settings there, and turn them off only if you accept that buckets in this account may then be made public.

### 1.3 CORS on both buckets

Browsers (the dashboard and the website) upload files **straight to S3** with a form POST that the API signs (see `docs/frontend/uploads.md`). The dashboard also opens files from the links the API gives. A browser only allows these cross-site requests when the bucket's CORS rules list the site's address. The mobile app is not a browser and does not need CORS.

On **each** bucket, open **Permissions**, find **Cross-origin resource sharing (CORS)**, and choose **Edit**. Paste the following, with the origins of your staging websites. Add `http://localhost:3001` (or whatever port the dashboard uses locally) if developers test against staging from their machines.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["POST", "GET", "HEAD"],
    "AllowedOrigins": [
      "https://<staging-dashboard-origin>",
      "https://<staging-website-origin>"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Write each origin exactly as the browser shows it: scheme and host, with no path and no trailing slash. Until the websites have addresses, leave only the localhost one, or come back to this step later. Uploads from the mobile app work without it.

### 1.4 An IAM user with a key limited to the two buckets

1. Open **IAM**, then **Users**, then **Create user**. **Name:** `jazla-staging-api`. Do **not** give it console access. Choose **Next**.
2. Choose **Attach policies directly**, then **Create policy**. This opens a new tab. Switch to **JSON** and paste the following, with your two bucket names:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "ObjectsOfTheTwoBuckets",
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:GetObjectAnnotation",
           "s3:PutObjectAnnotation"
         ],
         "Resource": [
           "arn:aws:s3:::jazla-staging-public-<suffix>/*",
           "arn:aws:s3:::jazla-staging-private-<suffix>/*"
         ]
       },
       {
         "Sid": "MissingFilesAnswerNotFound",
         "Effect": "Allow",
         "Action": "s3:ListBucket",
         "Resource": [
           "arn:aws:s3:::jazla-staging-public-<suffix>",
           "arn:aws:s3:::jazla-staging-private-<suffix>"
         ]
       }
     ]
   }
   ```

   Name it `jazla-staging-storage`, then **Create policy**. Back on the user, refresh the list, tick it, and choose **Next**, then **Create user**.

   Why each permission is there:

   | Permission | Needed for |
   |---|---|
   | `s3:PutObject` | Signing upload forms, and the copy that moves a checked upload into place. |
   | `s3:GetObject` | Reading a file's start to check its type, its size (a HEAD request), the source of that copy, and signing download links. |
   | `s3:DeleteObject` | Removing rejected, expired and deleted uploads. |
   | `s3:ListBucket` | Without it, S3 answers **403 instead of 404** for a missing file (AWS's HeadObject documentation). The API reads "not found" from the 404. |
   | `s3:GetObjectAnnotation`, `s3:PutObjectAnnotation` | AWS's CopyObject documentation says a copy carries the source's annotations by default, which needs these two. Without them, the copy could be refused. |

3. Open the user, go to **Security credentials**, then **Access keys**, then **Create access key**. Choose **Application running outside AWS**, then create it. **Copy the access key ID and the secret access key now.** The secret is shown only once. You will paste both into Render in step 2.

### 1.5 The values for Render

| Render variable | Value |
|---|---|
| `STORAGE_PUBLIC_BUCKET` | `jazla-staging-public-<suffix>` |
| `STORAGE_PRIVATE_BUCKET` | `jazla-staging-private-<suffix>` |
| `STORAGE_PUBLIC_BASE_URL` | `https://jazla-staging-public-<suffix>.s3.eu-central-1.amazonaws.com` (no trailing slash) |
| `STORAGE_ACCESS_KEY_ID` | the access key ID from 1.4 |
| `STORAGE_SECRET_ACCESS_KEY` | the secret access key from 1.4 |

`STORAGE_ENDPOINT` (`https://s3.eu-central-1.amazonaws.com`), `STORAGE_REGION` (`eu-central-1`) and `STORAGE_FORCE_PATH_STYLE` (`false`) are already set in `render.yaml`.

---

## 2. Render: create everything from the Blueprint

### 2.1 Generate the secrets first

Run each command on your computer (macOS, Linux, or Git Bash on Windows), and keep the outputs in your password manager. **Never commit them, and never paste them in chat.**

| Variable | How to make it | Notes |
|---|---|---|
| `AUTH_ACCESS_TOKEN_SECRET` | `openssl rand -base64 48` | Signs sign-in tokens. Changing it signs everyone out. |
| `AUTH_OTP_SECRET` | `openssl rand -base64 48` (a **different** run) | Hashes verification codes. |
| `VENDORS_IBAN_KEY` | `openssl rand -base64 32` | Encrypts vendors' IBANs. **Keep it safe:** if it is lost, every stored IBAN becomes unreadable. |
| `AUTH_REVIEW_ACCOUNTS` | see section 4 | The phones that sign in with a fixed code. |
| `CORS_ORIGINS` | the staging website origins, comma-separated | Empty turns CORS off; the mobile app does not need it. |

### 2.2 Create the services

1. Sign in at [dashboard.render.com](https://dashboard.render.com), then connect your GitHub account and give Render access to the `frentex-tech/jazlah` repository.
2. Choose **New**, then **Blueprint**. Pick the repository, branch `develop`, and the file `render.yaml`.
3. Render lists three resources:
   - `jazla-api-staging` (web service);
   - `jazla-redis-staging` (Key Value);
   - `jazla-db-staging` (Postgres).

   It then asks for every variable marked `sync: false`:
   - `CORS_ORIGINS`;
   - the five `STORAGE_*` values from 1.5;
   - `AUTH_ACCESS_TOKEN_SECRET`, `AUTH_OTP_SECRET`, `AUTH_REVIEW_ACCOUNTS` and `VENDORS_IBAN_KEY`.

   Paste each one.

   **Render asks for these only once, at this step.** To change one later, go to the service's **Environment** page.
4. Choose **Apply**. Render then creates the database and Key Value, builds the Docker image, runs the migrations (the **pre-deploy command**, `prisma migrate deploy`), and starts the API. The first build takes several minutes.

How a deploy works from now on:
- Every merge into `develop` whose GitHub checks pass is deployed (`autoDeployTrigger: checksPass`).
- The migrations run **once per deploy**, before the new version starts.
- If they fail, the deploy stops and the previous version keeps running.

### 2.3 The staging address

The service's page shows its address, `https://jazla-api-staging-<random>.onrender.com`. Then:
- Replace the placeholder in `docs/frontend/README.md` ("Base URL per environment") with it, in a small pull request.
- Send it to the frontend team.

---

## 3. Seed staging once, deliberately

The seed fills the database with the development data: reference lists, vendors, products in every state, and the development accounts. It also uploads its placeholder images to the S3 buckets. It **refuses production always**. On staging it runs **only with an explicit confirmation flag**, so it never runs by accident.

1. Open the service `jazla-api-staging`, then the **Shell** tab.
2. Run:
   ```bash
   node dist-seed/prisma/seed/seed.js --allow-staging
   ```
3. It prints what it created and an `AUTH_REVIEW_ACCOUNTS` line for the development accounts (phones `0500000001` to `0500000005`). To sign in with those accounts on staging, add the pairs you want to `AUTH_REVIEW_ACCOUNTS` (section 4).

Running it again changes nothing: it is idempotent. Never run it on production; it refuses anyway.

---

## 4. Review accounts for the owner and the team

On staging no SMS is sent. You can sign in in two ways:
- with a **review account**, which uses a fixed code;
- by reading the code from the log (section 6).

Review accounts are easier for phones you test with every day.

1. **Pick one 6-digit code per phone.** Use different codes, not `123456`.
2. **Set `AUTH_REVIEW_ACCOUNTS`** on the service's **Environment** page as `phone:code` pairs, comma-separated:
   ```
   +966512345678:482913,+966598765432:730154
   ```
   Use **only numbers the company or the person controls**. Every sign-in with one is logged at `warn`.
3. **Save.** Render restarts the service with the new value.
4. **Give staff access where needed.** A review account signs in as a **customer** at once. For the **admin dashboard** the phone also needs admin access. In the service's **Shell**, run:
   ```bash
   node dist/create-admin +966512345678
   ```
   It is idempotent. Vendor access comes from an approved vendor application, as in production.

---

## 5. Check that it works

Replace `<host>` with the service's address.

1. **Liveness:** open `https://<host>/v1/health`. It should answer `{"status":"ok"}`.
2. **Readiness:** open `https://<host>/v1/health/ready`. It should answer 200, with PostgreSQL and Redis both `ok`. A 503 names what is down.
3. **Swagger:** open `https://<host>/docs` for the documentation page. `https://<host>/docs-json` serves the OpenAPI document. Both are on because `API_DOCS_ENABLED=true`.
4. **Sign in with a review account**, for example with the Swagger page or `curl`:
   ```bash
   curl -X POST https://<host>/v1/public/auth/otp/request \
     -H 'Content-Type: application/json' \
     -d '{"phone":"0512345678","audience":"customer"}'
   curl -X POST https://<host>/v1/public/auth/otp/verify \
     -H 'Content-Type: application/json' \
     -d '{"phone":"0512345678","audience":"customer","code":"482913","devicePlatform":"web"}'
   ```
   The second call answers with an access token and a refresh token.
5. **Upload a file**, from the app or the dashboard, then open its URL. A public image should open at `https://jazla-staging-public-<suffix>.s3.eu-central-1.amazonaws.com/...`.
6. **Check the client address** (`TRUST_PROXY_HOPS`). In the logs (section 6), find your own request. Its client address (`req.ip` in the request log) should be **your** public IP; look it up at a "what is my IP" site.
   - If it shows a Render address instead, raise `TRUST_PROXY_HOPS` by one on the **Environment** page.
   - If it shows an address you could have forged with an `X-Forwarded-For` header, lower it.

   Rate limits are counted by this address, so it must be right.

---

## 6. Reading the logs

Open the service, then the **Logs** tab. Each line is one JSON object (pino), with the request id (`x-request-id`) on every line of a request.

- **Sign-in codes (the `log` SMS provider):** search for `SMS written to the log instead of sent`. The line holds:
  - `to`: the phone;
  - `text`: the message with the code.

  This is the only place a non-review phone can read its code on staging.
- **Errors:** search for `"level":50` (error) or `"level":60` (fatal), or for a request id the app showed.
- **Deploys and migrations:** the **Events** tab lists each deploy. Open one to see its build log and the pre-deploy (`prisma migrate deploy`) output.

---

## Before you start: what you need

- **A Render account with billing enabled.** All three resources are on paid plans (see "Costs" above).
- **An AWS account** with billing, to create the buckets and the IAM user.
- **The staging website addresses**, for CORS. You can add them later.
- **The phones and codes** for the review accounts.
- **A safe place for the secrets**, such as a password manager, especially `VENDORS_IBAN_KEY`.
