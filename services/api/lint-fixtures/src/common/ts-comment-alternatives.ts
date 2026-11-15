// lint-rule: R10-ts-ignore R10-ts-nocheck conforms
// @ts-check
// What to write instead of a banned comment: @ts-check is allowed, and an error the
// compiler must report is marked with a described @ts-expect-error. A sentence that
// names @ts-ignore or @ts-nocheck, as this one does, is not a directive.
// @ts-expect-error -- this fixture assigns a string to a number on purpose
export const count: number = 'three';
