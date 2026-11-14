// lint-rule: support
export interface CatalogFinder {
  findUnique: (id: string) => Promise<string | null>;
  findUniqueOrThrow: (id: string) => Promise<string>;
}
