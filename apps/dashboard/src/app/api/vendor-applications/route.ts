import type { NextRequest } from 'next/server';
import { onboardingBackend } from '@/features/vendor-onboarding/backend';
import { SubmitSchema } from '@/features/vendor-onboarding/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// The vendor application, with the applicant's customer session (VND-DSH-1).
export async function POST(req: NextRequest) {
  const parsed = SubmitSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'customer', async (token) =>
    parsed.success ? onboardingBackend().submitApplication(token, langOf(req), parsed.data) : invalidBody(parsed.error),
  );
}
