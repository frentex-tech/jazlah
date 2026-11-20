import type { NextRequest } from 'next/server';
import { onboardingBackend } from '@/features/vendor-onboarding/backend';
import { UpdateProfileSchema } from '@/features/vendor-onboarding/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

export function GET(req: NextRequest) {
  return withPanelSession(req, 'vendor', (token) => onboardingBackend().profile(token, langOf(req)));
}

export async function PATCH(req: NextRequest) {
  const parsed = UpdateProfileSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'vendor', async (token) =>
    parsed.success ? onboardingBackend().updateProfile(token, langOf(req), parsed.data) : invalidBody(parsed.error),
  );
}
