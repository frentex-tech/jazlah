import type { NextRequest } from 'next/server';
import { onboardingBackend } from '@/features/vendor-onboarding/backend';
import { DocumentUploadSchema } from '@/features/vendor-onboarding/schema';
import { withPanelSession } from '@/lib/auth/panel-session';
import { invalidBody, langOf } from '@/lib/route';

// Upload ticket for an application document (purpose vendor.document); docs/frontend/uploads.md.
export async function POST(req: NextRequest) {
  const parsed = DocumentUploadSchema.safeParse(await req.json().catch(() => null));
  return withPanelSession(req, 'customer', async (token) =>
    parsed.success ? onboardingBackend().requestDocumentUpload(token, langOf(req), parsed.data) : invalidBody(parsed.error),
  );
}
