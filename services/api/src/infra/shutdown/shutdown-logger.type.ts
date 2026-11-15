/** What `closeWithDeadline` logs through: nestjs-pino's Logger fits it. */
export interface ShutdownLogger {
  log(fields: object, message: string): void;
  error(fields: object, message: string): void;
}
