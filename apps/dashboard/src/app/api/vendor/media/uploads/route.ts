import type { NextRequest } from 'next/server';
import { onboardingBackend } from '@/features/vendor-onboarding/backend';
import { ImageUploadSchema } from '@/features/vendor-onboarding/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Upload ticket for the store logo or cover photo; docs/frontend/uploads.md.
export async function POST(req: NextRequest) {
  const parsed = ImageUploadSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'vendor', async (token) =>
    parsed.success ? onboardingBackend().requestImageUpload(token, langOf(req), parsed.data) : invalidBody(parsed.error),
  );
}
