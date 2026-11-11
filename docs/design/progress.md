
## #42 VND-DES-1 (run in Figma, PR opened)
- First-run fixes: `tokens.json` was stale on the #42/#148/#120/#201 branches (synced); `info-bg` / `success-bg` colors do not exist (notices use `sand`, in 40-44); new `35-nav-active.js` sets the side-nav active item per screen (74 screens, no unmatched paths; the component bakes a fixed active item).
- Result: 194 screens, lint clean, 0 image placeholders, 0 failing contrast checks (40: 77, 41: 22, 42: 27, 43: 22, 44: 31). Vendor page: 23 frames, no overlaps. Not done: Present-mode click-through, per-screen close-ups.
- Next: #148 (50-53), #120 (60-63), #201 (70-77). Branches need `35-nav-active.js` (cherry-pick from the #42 branch).
