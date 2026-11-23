# OPX-DES-1: after-sales, order tracking, notifications, operations dashboards

Figma: https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design (pages `10 Customer App`, `20 Customer Web`, `30 Admin`, `31 Vendor`). Arabic RTL, design-system components only, real photos, all states.

| Script | Screens |
|---|---|
| `70-OPX-DES-1-customer-mobile.js` | App: orders list, order detail + tracking + freshness, cancel with refund choice, complaint (form, status, list), notification center, support, marketing opt-in |
| `71-OPX-DES-1-customer-web.js` | Web (1440): order detail + tracking, cancel, complaint, notifications, support + marketing opt-in |
| `72-OPX-DES-1-vendor-board.js` | Vendor: live orders board, new-order alert, slaughter time picker, freshness photo upload, A6 order label |
| `73-OPX-DES-1-vendor-earnings.js` | Vendor: earnings and payouts |
| `74-OPX-DES-1-admin-overview-orders.js` | Admin: overview, orders |
| `75-OPX-DES-1-admin-customers-complaints.js` | Admin: customers, complaints |
| `76-OPX-DES-1-admin-delivery-finance.js` | Admin: delivery, finance |
| `77-OPX-DES-1-admin-staff-audit-campaign.js` | Admin: staff and roles, audit log, campaigns, access denied |

Notes: status pills for success/info use the neutral `sand` surface (no `success-bg`/`info-bg` token). Contrast self-checks for success/info text use `paper`, which is where that text sits. No prototype links for the admin screens (static design, per the brief).
Run order: 70-77, `32-photos.js` (twice), `35-nav-active.js`, `30-lint-screens.js`.
