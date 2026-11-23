# FED-DES-1: feed, marketplace listings, chat

Figma: https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design (pages `10 Customer App`, `20 Customer Web`, `30 Admin`). Arabic RTL, design-system components only, real photos.

| Script | Screens |
|---|---|
| `50-FED-DES-1-feed.js` | App: feed, search, filters sheet |
| `51-FED-DES-1-listing.js` | App and web: listing detail, post/edit listing |
| `52-FED-DES-1-chat.js` | App: chat list and conversation |
| `53-FED-DES-1-admin.js` | Admin: listings and chat reports |

Notes: filter and unit chips wrap onto a second row when they exceed the sheet width. The admin side nav has no moderation item, so `Admin/Feed/Listings` highlights Products and `Reports` highlights Customers (`35-nav-active.js`). Notices use `sand` (no `info-bg`/`success-bg` token).
Run order: 50-53, `32-photos.js` (twice), `35-nav-active.js`, `30-lint-screens.js`.
