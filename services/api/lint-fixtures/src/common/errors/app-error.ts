// lint-rule: R8 conforms
export class AppError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}
