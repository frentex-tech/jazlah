# ADR-0006: ZATCA e-invoicing (Phase 2) and seller of record

- **Status:** accepted
- **Date:** 2026-11-22
- **Decided by:** the owner (2026-11-22)

## Context
FR-PAY-05 asks for a ZATCA-compliant electronic tax invoice for every order, sent to the customer. Phase 2 (integration) means each invoice is:
- generated as UBL 2.1 XML;
- signed with a ZATCA-issued certificate (CSID);
- chained to the previous invoice by hash and counter;
- printed with a QR code.

Customer orders are B2C, so they get **simplified** invoices. Those are *reported* to ZATCA within 24 hours, rather than cleared before they are issued.

Jazlah sells its own products and partner vendors' products in the same order flow (`docs/delivery/STATUS.md`: Jazlah is vendor #1). Prices include 15 % VAT, and money is integer halalas.

## Decision

### 1. Jazlah is the seller of record for every order
- The customer gets **one tax invoice per order**, issued by Jazlah under the client's VAT number. It covers the items from every vendor, the delivery fee and the discounts.
- **Partner vendors supply Jazlah.** They do not sell to the customer on the platform. Jazlah settles with each vendor: the items subtotal after the vendor's own discounts, minus the commission. This is the commission base already in STATUS.
- **Vendors do not onboard with ZATCA through the platform.** If a vendor is VAT-registered, it invoices Jazlah outside the platform. The platform gives it a settlement statement to invoice from.
- **Rejected: vendor-issued invoices.** Every vendor would need its own VAT registration and its own ZATCA onboarding (its own EGS and CSID). Small vendors below the VAT threshold could not sell at all. The customer would also get one invoice per vendor for a single checkout.

### 2. Direct integration with ZATCA (Fatoora), behind a port
- The API generates, signs and reports the invoices itself through ZATCA's Fatoora APIs.
- There is no per-invoice fee, and the work on UBL, QR and PDF is already planned (INV-API-1).
- **Onboarding follows ZATCA's order, under the client's VAT number:**
  1. Generate a CSR.
  2. The client takes an OTP from the Fatoora portal.
  3. Get the compliance CSID.
  4. Pass ZATCA's compliance checks.
  5. Get the production CSID.

  The developer portal (sandbox) and the simulation environment come before production.
- **Rejected for launch: a third-party e-invoicing provider.** It costs a subscription or a per-invoice fee, it adds a vendor in the order path, and the invoice data leaves our system. It stays the fallback. Because of the port, switching to a provider adds one provider file and changes no business code.

### 3. The port: `services/api/src/integrations/zatca/`
It follows the layout in `services/api/src/integrations/README.md`: a port, types, errors, a service, a module, `index.ts`, and `providers/` with one file per vendor plus a fake.

```ts
export interface ZatcaPort {
  readonly name: string;
  /** Builds, hashes, signs and QR-codes one invoice. It chains onto the previous invoice's hash. */
  sign(draft: InvoiceDraft): Promise<SignedInvoice>;
  /** Reports a signed simplified invoice. It resolves to reported, reported with warnings, or rejected. */
  report(invoice: SignedInvoice, signal: AbortSignal): Promise<ZatcaReport>;
}
```

- **Providers:**
  - `fatoora.provider.ts` is the direct integration. `ZATCA_ENV` selects the sandbox, simulation or production environment.
  - `fake.provider.ts` is for local runs, tests and staging, until the client's CSID exists.
- **Business code never sees XML or certificates.** The invoices module builds the `InvoiceDraft`, which holds the lines, VAT per line in halalas, the totals and the order reference. It keeps the returned XML, hash, QR and status.
- **Signing runs one invoice at a time.** The hash chain and the counter need a strict order, so each signature takes a database lock on the counter row. Reporting is a retried job that finishes within the 24 hours.
- **Secrets stay out of the repo.** The CSID and the private key live in the host's secret manager.

## Consequences
- **Orders store VAT per line and per order** in halalas. The prices shown already include VAT.
- **`Vendor.vatNumber` is optional.** It is recorded when the vendor has one, and printed on the settlement statement.
- **The commission is a settlement rule** (what Jazlah keeps). At launch it is not a separate invoice to the vendor. FIN-API-1 builds the settlement on this basis.
- **Advance payments are invoiced when received.** These are occasion deposits, animal deposits and visit fees. Under KSA VAT, receiving the payment is the tax point. The final invoice deducts the advance.
- **Refunds and cancellations after an invoice** issue a credit note through the same port.
- **What the client must provide before production:**
  - the VAT number and the Fatoora portal access, for the OTP;
  - their accountant's check of this treatment before the production CSID is requested.

  Both are in `docs/accounts.md`.
- **Until then, development and staging use the fake provider.** The port's contract does not change when the real one arrives.
