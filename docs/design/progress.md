
## #120 OCC-DES-1 (run in Figma, PR opened)
- First run: the 60-63 scripts failed on `kind + "-bg"` pills (no `success-bg`/`info-bg` tokens). Fixed to `sand` surface with `ink` text (success on sand was 3.93, failing). Final contrast checks 188 / 192 / 184 / 83, failing 0. `35-nav-active.js` got Occasions/Kitchens/Adha/Board paths (121 screens matched; Vendor/Visits/Calendar and Vendor/Animals/Register have no nav item).
- Lint: 405 screens, undefined/placeholder/outside none, `LINT OK images`.
- Figma showed "Connection issue affecting saving" once during this run; it cleared afterwards. If anything is missing in the file, rerun the task scripts (idempotent).
