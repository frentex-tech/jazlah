# Plan: the catalog module (not built)

The approved plan for the catalog, the task after vendors (issue #235). Not loaded by default; CLAUDE.md points here. Read with `.claude/rules/` and the add-module skill. Paths are relative to `services/api/`. Build nothing this plan does not list; anything it leaves open is asked, not guessed.

## Shape

- **Four-layer `catalog` module** (add it to `FOUR_LAYER_MODULES`, with its DECISIONS line).
- **Money first**, at its reserved place `src/common/money/` (registry, "Reserved names"): integer halalas, half-up rounding, and a split by basis points whose parts always sum back to the whole. Unit tests as `testing.md` requires (zero, one halala, rounding).

## Tables

categories, products, product_images, product_sizes, cutting_styles, exclusion_items, meat_types, product_cuttings, product_packagings, product_exclusions, cutting_packaging_incompatibilities, product_change_requests.

## Product

- Belongs to a vendor and a category, with an optional meat type.
- Status: `draft`, `pending_review`, `published`, `rejected`; plus an availability switch.
- Fulfilment: delivery, pickup or both.
- `min_price_halalas` kept in step with its sizes.

## Options

- **Sizes:** an approximate weight, a price, and one optional tag.
- **Cutting styles:** a shared admin list, with an optional extra price per product.
- **Packaging:** trays, bags, vacuum or none; no price.
- **Compatibility** between cutting and packaging: global rules.
- **"Without" items:** a shared admin list.

## Review

- A vendor's products need admin approval; admins publish JAZLA's products (the platform vendor's) directly.
- On a published product, availability, prices and fulfilment apply at once, each price change with an audit entry (`AuditLogWriter`).
- Any other edit becomes one pending change request while the live version stays; a second edit replaces the pending request.

## Public queries

- Only published, available products of active vendors and active categories.
- Catalog may join `vendors.status` read-only: a recorded exception to "a module reads only its own tables" (DECISIONS line with the module).
- Filters: category, vendor, meat type, price range. Keyset pagination (`http.md`, "Lists").

## Errors

PRODUCT_NOT_EDITABLE (409), PRODUCT_NOT_SUBMITTABLE (422), with Arabic and English messages in the product's voice.
