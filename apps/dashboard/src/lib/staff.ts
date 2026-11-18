import type { Panel } from './session';

/** Display name for the top bar. shortcut: demo name until ACC-DSH-1 reads /v1/<panel>/me. */
export async function getStaffName(_panel: Panel): Promise<string> {
  return 'عبدالرحمن';
}
