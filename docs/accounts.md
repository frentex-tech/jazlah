# External accounts

The client owns every account below. Frentex is added as admin or developer, and never as the owner. This file holds no passwords, keys or tokens. Those live in each provider and in the host's secret manager.

The decision behind the hosting rows is in ADR-0003 (`docs/adr/0003-hosting.md`).

| Account | Used for | Owner | Frentex access | Status |
|---|---|---|---|---|
| Render | Staging API and dashboard (free) | Owner | Owner's sessions | ✅ Live (2026-11-22) |
| Neon (`jazlah-staging`) | Staging PostgreSQL (free) | Owner | Owner's sessions | ✅ Live |
| Upstash (`jazlah-staging`) | Staging Redis (free) | Owner | Owner's sessions | ✅ Live |
| AWS (S3) | Staging image uploads (guide step 7) | Owner | None (bucket name only) | ⏳ Open |
| Google Cloud via CNTXT (`me-central2`) | Production hosting (ADR-0003) | Client | Admin | ⏳ Open |
| Domain & DNS | Production addresses (#138) | Client | DNS records only | ⏳ Open |
| Apple Developer (organization) | iOS app | Client | Developer, App Manager | ⏳ Open |
| Google Play Console | Android app | Client | Admin for releases | ⏳ Open |
| Firebase (dev, staging, prod) | Push notifications | Client | Editor | ⏳ Open |
| Google Maps Platform | Maps and addresses, with billing and restricted keys | Client | Editor | ⏳ Open |
| Email sender | Transactional email | Client | Admin | ⏳ Open |
| SMS provider + sender ID | Login codes | Client | Developer | ⏳ Open: a fake provider is used until the keys arrive |
| Payment gateway | Online payments | Client | Developer (sandbox first) | ⏳ Open: a fake provider is used until the keys arrive |
| Delivery company | Shipping (DLV-API-2) | Client | Developer (sandbox first) | ⏳ Open |
| ZATCA Fatoora portal | E-invoicing onboarding (ADR-0006) | Client, with the VAT number | None (the client gives the OTP) | ⏳ Open |

When the client opens an account, update its row: the status, and who has access.
