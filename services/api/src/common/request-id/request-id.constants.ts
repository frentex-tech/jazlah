/** The request and response header that carries the request id. */
export const REQUEST_ID_HEADER = 'x-request-id';

/** The longest incoming request id that is accepted as it is. */
export const REQUEST_ID_MAX_LENGTH = 128;

/** Characters an incoming request id may contain. Anything else is replaced. */
export const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;
