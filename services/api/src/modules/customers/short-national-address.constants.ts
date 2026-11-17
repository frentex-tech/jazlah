/**
 * The Saudi short national address (Saudi Post's national address code): four letters
 * then four digits, `RRRD2929`. Stored uppercase without spaces; the format is also the
 * check constraint `customer_addresses_text_check`.
 */
export const SHORT_NATIONAL_ADDRESS = /^[A-Z]{4}\d{4}$/;
