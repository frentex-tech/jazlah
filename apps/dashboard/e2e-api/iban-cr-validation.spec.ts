import { expect, test } from '@playwright/test';
import { compactDigits, ibanElectronic, isCrNumber, isSaudiIban } from '../src/features/vendor-onboarding/validators';
import { API_URL, CUSTOMER, customerToken } from './helpers';

// VND-DSH-1: the application's client checks of the IBAN and the registration number agree with the API's. Each value
// goes to POST /v1/customer/vendor-applications in a body that is refused anyway (an invalid document), so nothing is
// submitted: the API flags the field exactly when the dashboard's validator refuses the value. Both the value as typed
// and as the form sends it (normalised) are tried.
const IBANS = ['SA0380000000608010167519', 'sa03 8000 0000 6080 1016 7519', 'SA0380000000608010167518', 'SA038000000060801016751', 'GB82WEST12345698765432'];
const CRS = ['1010458216', '١٠١٠٤٥٨٢١٦', '10104582', '101045821a', '10104582160'];

test('the IBAN and registration number checks match the API', async () => {
  const token = await customerToken(CUSTOMER);
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
    const r = await fetch(`${API_URL}/v1/customer/vendor-applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const res = (await r.json()) as { code: string; details?: { field: string }[] };
    expect(res.code, JSON.stringify(res)).toBe('VALIDATION_FAILED');
    return !!res.details?.some((d) => d.field === field);
  };
  for (const iban of IBANS.flatMap((x) => [x, ibanElectronic(x)])) expect(await flagged('iban', iban), iban).toBe(!isSaudiIban(iban));
  for (const cr of CRS.flatMap((x) => [x, compactDigits(x)])) expect(await flagged('commercialRegistrationNumber', cr), cr).toBe(!isCrNumber(cr));
});
