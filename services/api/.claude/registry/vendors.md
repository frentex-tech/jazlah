# Registry: Vendors

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **VendorsModule** — `src/modules/vendors/index.ts` — applications, vendors, commission history; provides `VENDOR_STATUS_CHECKER` (auth's guard and sign-in ask it).
- **PlatformVendorModule** — `src/modules/vendors/platform-vendor.module.ts` — the vendor repository and history with nothing but the database; `CreatePlatformVendorUseCase` (`pnpm vendor:create-platform`).
- **VendorDirectory** — `src/modules/vendors/application/vendor-directory.service.ts` — exported reads for other modules: `platformVendorId()`, `namesOf(ids)` (the catalog), `storeOf(id)` (a store's pickup facts, `VendorStore`: scheduling).
- **EraseApplicantDataUseCase** — `src/modules/vendors/application/erase-applicant-data.use-case.ts` — an account deletion's part in vendors: pending and rejected applications removed, their documents discarded; approved ones kept (the auth module's deletion).
- **VendorDirectory.commissionBasisPointsOf** — `src/modules/vendors/application/vendor-directory.service.ts` — a vendor's commission now, copied onto each order when placed.
