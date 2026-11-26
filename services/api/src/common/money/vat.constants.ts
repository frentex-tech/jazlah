/**
 * Saudi VAT, 15%, as the fraction of a VAT-inclusive price that is VAT: 15 / 115.
 * Prices include VAT (CLAUDE.md), so the VAT inside a total is
 * `total.multiplyByFraction(VAT_IN_GROSS.numerator, VAT_IN_GROSS.denominator)`, rounded
 * half up (the contract: "round half up of total × 15 / 115").
 */
export const VAT_IN_GROSS = { numerator: 15, denominator: 115 } as const;
