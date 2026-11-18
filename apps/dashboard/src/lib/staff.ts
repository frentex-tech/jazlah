import { cookies } from 'next/headers';
import { phoneCookie, type Panel } from './session';

/**
 * What the top bar shows for the signed-in user. The API has no staff display name yet (`GET /v1/<panel>/me` returns
 * the principal only), so this is the masked phone from the sign-in answer.
 */
export async function getStaffName(panel: Panel): Promise<string> {
  return (await cookies()).get(phoneCookie(panel))?.value ?? '';
}
