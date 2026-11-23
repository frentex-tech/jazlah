# OCC-DES-1: occasions, visits, cooking and Adha

Figma: https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design (pages `10 Customer App`, `30 Admin`, `31 Vendor`, `32 Kitchen`). Arabic RTL, design-system components only, real photos, all states.

| Script | Screens |
|---|---|
| `60-OCC-DES-1-occasions.js` | App: occasion request, quote, booking |
| `61-OCC-DES-1-visits.js` | App and vendor: farm/market visits |
| `62-OCC-DES-1-cooking-adha.js` | App: cooking service and Adha orders |
| `63-OCC-DES-1-dashboard.js` | Admin, vendor and kitchen dashboards |

Notes: status pills for success/info use `ink` text on the neutral `sand` surface (the token set has no `success-bg` or `info-bg`; success green on sand is 3.93:1). `Vendor/Visits/Calendar` and `Vendor/Animals/Register` have no vendor side-nav item, so no item is highlighted there (a nav entry is a product decision).
Run order: 60-63, `32-photos.js` (twice), `35-nav-active.js`, `30-lint-screens.js`.
