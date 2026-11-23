# VND-DES-1: vendor onboarding, store profile, product catalog

Figma: https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design (pages `30 Admin`, `31 Vendor`, `20 Customer Web`). All screens are Arabic RTL and use design-system components only.

| Script | Screens |
|---|---|
| `40-VND-DES-1-apply.js` | Web: vendor application (5 steps) and application status |
| `41-VND-DES-1-admin-vendors.js` | Admin: vendor list, vendor review |
| `42-VND-DES-1-products.js` | Admin: product catalog and moderation |
| `43-VND-DES-1-vendor-profile-products.js` | Vendor: store profile and product list |
| `44-VND-DES-1-product-form.js` | Vendor: product form, rejection feedback |

Behaviour notes: the application is a multi-step form with auto-saved drafts; errors show under the field and block the next step; file limit 5 MB. Notices use the neutral `sand` surface (no `info-bg` or `success-bg` token exists).
Run order: 40-44, then `32-photos.js` (twice), `35-nav-active.js`, `30-lint-screens.js`.
