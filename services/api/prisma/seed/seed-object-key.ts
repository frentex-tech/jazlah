import { SEED_EPOCH } from './seed-epoch.constants';
import { seedId } from './seed-id';

/**
 * The object key of a seeded file, in the shape MediaService gives a confirmed upload's
 * checked copy: `<purpose with dots as slashes>/<yyyy>/<mm>/<dd>/<media id>/<attempt>`,
 * the date being the row's creation (SEED_EPOCH, UTC). The attempt segment, random for a
 * real upload, is derived from the id here, so every run writes the same key.
 */
export function seedObjectKey(purpose: string, mediaId: string): string {
  const day = SEED_EPOCH.toISOString().slice(0, 10).replaceAll('-', '/');
  const attempt = seedId(`media-attempt:${mediaId}`);
  return `${purpose.replaceAll('.', '/')}/${day}/${mediaId}/${attempt}`;
}
