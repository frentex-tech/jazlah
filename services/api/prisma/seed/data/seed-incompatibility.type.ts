import type { SeedPackaging } from './seed-packaging.type';

/** A cutting and packaging rule the seed creates: this cutting style cannot be packed this way. */
export type SeedIncompatibility = Readonly<{
  cuttingStyle: string;
  packaging: SeedPackaging;
}>;
