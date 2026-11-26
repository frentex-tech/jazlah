# Registry: Money

One line per building block: name, path, purpose; the detail is in that file's doc comment. Listed by the index, `.claude/REGISTRY.md`. Paths are relative to `services/api/`.

- **Money** — `src/common/money/money.ts` — every amount in integer halalas: add, subtract, multiply by a quantity, sum, min, compare, split by basis points (parts sum back; half a halala rounds up), multiply by a fraction (half up); `src/common/money/basis-points.constants.ts`.
- **VAT_IN_GROSS** — `src/common/money/vat.constants.ts` — the VAT inside a price that includes it, as a fraction (15/115) for `multiplyByFraction`.
