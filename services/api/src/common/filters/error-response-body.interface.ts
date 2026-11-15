/** The body of every error response. The HTTP status is in the status line. */
export interface ErrorResponseBody {
  code: string;
  message: string;
  details?: unknown;
  requestId: string;
}
