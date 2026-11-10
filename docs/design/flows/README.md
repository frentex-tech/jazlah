# Flows, information architecture and LTR rules (DSN-DES-1)

Figma file: [Jazlah — Product Design](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design). All diagrams are in Arabic (RTL); the first step sits on the right.

| What | Page | Link |
|---|---|---|
| Customer app map (4 tabs: Home, Services, Orders, Account) | 90 Flows | [section](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=15-104) |
| Dashboard sitemaps (admin, vendor, kitchen) | 90 Flows | [section](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=15-468) |
| Key flows: regular order (6 steps, NFR-USB), occasion, farm visit, cook it for me, Adha, feed + chat | 90 Flows | [section](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=15-642) |
| LTR rules: Home | 99 LTR Rules | [section](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=16-2379) |
| LTR rules: Product | 99 LTR Rules | [section](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=16-2697) |
| LTR rules: Checkout | 99 LTR Rules | [section](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=16-2856) |
| LTR rules: Admin table | 99 LTR Rules | [section](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=16-3011) |
| Cover with clickable index | 00 Cover | [page](https://www.figma.com/design/puWXbmOVpnQpjc7mUahTnw/Jazlah-Product-Design?node-id=0-1) |

Notes for developers
- Regular order: product → customize → cart → fulfilment and day → payment → order placed. Six steps.
- English (LTR) is not a second design: each frame on `99 LTR Rules` is the Arabic frame mirrored by script (rows reversed, directional icons swapped, copy translated). Numbers, prices and the logo do not mirror.
- The stepper keeps "+" at the start edge in both directions (right in RTL, left in LTR).
- PNG exports are not committed yet: Figma's own export is needed (see `docs/design/progress.md`).
