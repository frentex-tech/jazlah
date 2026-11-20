import type { NextRequest } from 'next/server';
import { onboardingBackend } from '@/features/vendor-onboarding/backend';
import { withPanelSession } from '@/lib/auth/panel-session';
import { langOf } from '@/lib/route';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withPanelSession(req, 'customer', (token) => onboardingBackend().confirmDocumentUpload(token, langOf(req), id));
}
