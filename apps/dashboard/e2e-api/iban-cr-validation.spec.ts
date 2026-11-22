import { expect, test } from '@playwright/test';
import { isCrNumber, isSaudiIban } from '../src/features/vendor-onboarding/validators';
import { API_URL, APPLICANT } from './helpers';

// VND-DSH-1 (runs before vendor-application.spec.ts, while the applicant is a customer only): the application's client checks of the IBAN and the registration number agree with the API's. Each value
// goes to POST /v1/customer/vendor-applications in a body that is refused anyway (an invalid document), so nothing is
// submitted: the API flags the field exactly when the dashboard's validator refuses the value.
const post = (path: string, body: unknown, token?: string) =>
  fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });

async function customerToken() {
  const who = { phone: APPLICANT.phone, audience: 'customer' };
  // The API's resend wait (1 s in the CI job) may refuse a code asked for right after another spec's.
  await expect(async () => expect((await post('/v1/public/auth/otp/request', who)).status).toBe(200)).toPass({ intervals: [1_500], timeout: 15_000 });
  const r = await post('/v1/public/auth/otp/verify', { ...who, code: APPLICANT.code, devicePlatform: 'web' });
  expect(r.status, await r.clone().text()).toBe(200);
  return ((await r.json()) as { accessToken: string }).accessToken;
}

const IBANS = ['SA0380000000608010167519', 'sa03 8000 0000 6080 1016 7519', 'SA0380000000608010167518', 'SA038000000060801016751', 'GB82WEST12345698765432'];
const CRS = ['1010458216', '١٠١٠٤٥٨٢١٦', '10104582', '101045821a', '10104582160'];

test('the IBAN and registration number checks match the API', async () => {
  const token = await customerToken();
  const flagged = async (field: string, value: string) => {
    const body = {
      name: { ar: 'ملحمة التحقق', en: 'Validation Butchery' },
      commercialRegistrationNumber: '1010458216',
      city: 'الرياض',
      iban: 'SA0380000000608010167519',
      accountHolderName: 'مؤسسة التحقق',
      location: { latitude: 24.7136, longitude: 46.6753 },
      documents: [{ kind: 'not-a-kind', mediaId: 'not-a-uuid' }], // always refused: the application is never sent
      [field]: value,
    };
    const r = await post('/v1/customer/vendor-applications', body, token);
    const res = (await r.json()) as { code: string; details?: { field: string }[] };
    expect(res.code, JSON.stringify(res)).toBe('VALIDATION_FAILED');
    return !!res.details?.some((d) => d.field === field);
  };
  for (const iban of IBANS) expect(await flagged('iban', iban), iban).toBe(!isSaudiIban(iban));
  for (const cr of CRS) expect(await flagged('commercialRegistrationNumber', cr), cr).toBe(!isCrNumber(cr));
});
