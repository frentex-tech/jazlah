import type { OperationsSettings } from './operations-settings.type';

/** A partial update: each key present replaces its saved value; the pause has its own call. */
export type OperationsSettingsChanges = Partial<
  Omit<OperationsSettings, 'paused' | 'updatedAt'>
>;
